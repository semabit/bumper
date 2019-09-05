const fs = require('fs');
const {EOL} = require('os');
const test = require('ava');
const mock = require('mock-fs');
const {factory, runTasks} = require('release-it/test/util');
const Plugin = require('.');
const YAML = require('yamljs');

mock({
    './bower.json': JSON.stringify({version: '1.0.0'}),
    './foo.txt': '2.0.0\n',
    './manifest.json': '{}',
    './parameters.yml': YAML.stringify({version: '3.0.0'}),
    './app.yml': YAML.stringify({content: {'app.version': '3.0.3'}}, null, 10),
});

const namespace = 'bumper';

const readFile = file =>
    fs.readFileSync(file)
        .toString()
        .trim();

test('should not throw', async t => {
    const options = {[namespace]: {}};
    const plugin = factory(Plugin, {namespace, options});
    await t.notThrowsAsync(runTasks(plugin));
});

test('should return latest version from JSON file', async t => {
    const options = {[namespace]: {in: './bower.json'}};
    const plugin = factory(Plugin, {namespace, options});
    const version = await plugin.getLatestVersion();
    t.is(version, '1.0.0');
});

test('should return latest version from plain text file', async t => {
    const options = {[namespace]: {in: {file: './foo.txt', type: 'text/plain'}}};
    const plugin = factory(Plugin, {namespace, options});
    const version = await plugin.getLatestVersion();
    t.is(version, '2.0.0');
});

test('should return latest version from YAML file', async t => {
    const options = {[namespace]: {in: {file: './parameters.yml', type: 'application/x-yaml'}}};
    const plugin = factory(Plugin, {namespace, options});
    const version = await plugin.getLatestVersion();
    t.is(version, '3.0.0');
});

test('should write indented JSON file', async t => {
    const options = {[namespace]: {out: './manifest.json'}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('1.2.3');
    t.is(readFile('./manifest.json'), `{${EOL}  "version": "1.2.3"${EOL}}`);
});

test('should write indented YAML file', async t => {
    // DKTODO: should be 10 indent
    console.debug(readFile('./app.yml'));

    const options = {
        [namespace]: {
            out: [{
                file: './app.yml',
                type: 'application/x-yaml',
                path: "content['app.version']"
            }]
        }
    };
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('2.4.5');
    console.debug(readFile('./app.yml'));
    t.is(readFile('./app.yml'), `content:${EOL}          app.version: 2.4.5`);
});

test('should write new, indented JSON file', async t => {
    const options = {[namespace]: {out: ['./null.json']}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('0.0.0');
    t.is(readFile('./null.json'), `{${EOL}  "version": "0.0.0"${EOL}}`);
});

test('should write new YAML file', async t => {
    const options = {[namespace]: {out: [{file: './new.yml', type: 'application/x-yaml'}]}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('0.0.0');
    t.is(readFile('./new.yml'), `version: 0.0.0`);
});

test('should write version at path', async t => {
    const options = {[namespace]: {out: {file: './deep.json', path: 'deep.sub.version'}}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('1.2.3');
    t.is(readFile('./deep.json'), JSON.stringify({deep: {sub: {version: '1.2.3'}}}, null, '  '));
});

test('should write plain text file', async t => {
    const options = {[namespace]: {out: [{file: './VERSION', type: 'text/plain'}]}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('3.2.1');
    t.is(readFile('./VERSION'), '3.2.1');
});
