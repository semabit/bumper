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
    './parameters.yml': YAML.stringify({version: '3.0.0'}),
    './widget.xml': '<?xml version="1.0" encoding="utf-8"?><widget version="4.0.0" xmlns="http://www.w3.org/ns/widgets"></widget>',
    './manifest.json': '{}',
    './manifest.xml': '',
    './indent.yml': YAML.stringify({content: {'v': '3.3.3'}}, null, 10),
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

test('should return latest version from XML file', async t => {
    const options = {[namespace]: {in: {file: './widget.xml', type: 'application/xml', path: 'widget.$.version'}}};
    const plugin = factory(Plugin, {namespace, options});
    const version = await plugin.getLatestVersion();
    t.is(version, '4.0.0');
});

test('should write indented JSON file', async t => {
    const options = {[namespace]: {out: './manifest.json'}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('1.2.3');
    t.is(readFile('./manifest.json'), `{${EOL}  "version": "1.2.3"${EOL}}`);
});

test('should write indented YAML file', async t => {
    const options = {[namespace]: {out: {file: './manifest.yml', type: 'application/x-yaml', path: "content.v"}}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('2.4.5');
    t.is(readFile('./manifest.yml'), `content:${EOL}  v: 2.4.5`);
});

test('should write indented YAML file (10 indent)', async t => {
    const options = {[namespace]: {out: {file: './indent.yml', type: 'application/x-yaml', path: "content.v"}}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('3.3.4');
    t.is(readFile('./indent.yml'), `content:${EOL}          v: 3.3.4`);
});

test('should write XML file', async t => {
    const options = {[namespace]: {out: {file: './manifest.xml', type: 'application/xml', path: 'main.$.version'}}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('6.7.8');
    t.is(readFile('./manifest.xml'), `<?xml version="1.0" encoding="utf-8"?>${EOL}<main version="6.7.8"/>`);
});

test('should write indented XML file', async t => {
    const options = {[namespace]: {out: {file: './widget.xml', type: 'application/xml', path: 'widget.$.version'}}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('5.9.6');
    t.is(readFile('./widget.xml'), `<?xml version="1.0" encoding="utf-8"?>${EOL}<widget version="5.9.6" xmlns="http://www.w3.org/ns/widgets"/>`);
});

test('should write new, indented JSON file', async t => {
    const options = {[namespace]: {out: ['./null.json']}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('0.0.0');
    t.is(readFile('./null.json'), `{${EOL}  "version": "0.0.0"${EOL}}`);
});

test('should write new, indented XML file', async t => {
    const options = {[namespace]: {out: [{file: './null.xml', type: 'application/xml', path: 'version'}]}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('0.0.0');
    t.is(readFile('./null.xml'), `<?xml version="1.0" encoding="utf-8"?>${EOL}<version>0.0.0</version>`);
});

test('should write new YAML file', async t => {
    const options = {[namespace]: {out: [{file: './null.yml', type: 'application/x-yaml'}]}};
    const plugin = factory(Plugin, {namespace, options});
    await plugin.bump('0.0.0');
    t.is(readFile('./null.yml'), `version: 0.0.0`);
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
