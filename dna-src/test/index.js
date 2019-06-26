const path = require('path')
const tape = require('tape')

const { Diorama, tapeExecutor, backwardCompatibilityMiddleware } = require('@holochain/diorama')

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.error('got unhandledRejection:', error);
});

const chat_dnaPath = "./dist/dna-src.dna.json"
const chat_dna = Diorama.dna(chat_dnaPath, 'chat')
const personas_dnaPath = "../../personas-profiles/dna/personas-profiles.dna.json"
const personas_dna = Diorama.dna(personas_dnaPath, 'personas', {uuid: 'agent1'})

const diorama = new Diorama({
  instances: {
    chat_instance: chat_dna,
    personas_instance: personas_dna
  },
  bridges: [
    Diorama.bridge('p-p-bridge', 'chat_instance', 'personas_instance')
  ],
  debugLog: false,
  executor: tapeExecutor(require('tape')),
  middleware: backwardCompatibilityMiddleware,
})

// require('./agent/profile')(diorama.registerScenario)
require('./agent/messages')(diorama.registerScenario)

diorama.run()


// const { Config, Container, Scenario } = require('@holochain/diorama')
// Scenario.setTape(require('tape'))
// const chat_dnaPath = "./dist/dna-src.dna.json"
// const chat_dna = Config.dna(chat_dnaPath, 'chat')
// const personas_dnaPath = "../../personas-profiles/dna/personas-profiles.dna.json"
// const personas_dna = Config.dna(personas_dnaPath, 'personas')
// const agentAlice = Config.agent("alice")
// const instanceAliceChat = Config.instance(agentAlice, chat_dna, 'chat_instance')
// const instanceAlicePersonas = Config.instance(agentAlice, personas_dna, 'personas_instance')
// const scenario = new Scenario([instanceAliceChat])
// const testBridge = Config.bridge('p-p-bridge', instanceAliceChat, instanceAlicePersonas)
// const scenarioBridge = new Scenario([instanceAliceChat, instanceAlicePersonas], { bridges: [testBridge], debugLog: true })
// /*----------  Chat  ----------*/
//
//
// const testNewChannelParams = {
//   name: "test new stream",
//   description: "for testing...",
//   initial_members: [],
//   public: true
// }
//
// const testMessage = {
//   timestamp: 0,
//   message_type: "text",
//   payload: "I am the message payload",
//   meta: "{}",
// }
//
// // scenarioBridge.runTape('Can register a profile and retrieve', async (t, {alice}) => {
// //   const register_result = await alice.callSync('chat', 'register', {name: 'alice', avatar_url: ''})
// //   console.log(register_result)
// //   t.equal(register_result.Ok.length, 63)
// //
// //   const get_profile_result = await alice.callSync('chat', 'get_member_profile', {agent_address: register_result.Ok})
// //   console.log(get_profile_result)
// // })
// //
// // scenarioBridge.runTape('Can create a public stream with no other members and retrieve it', async (t, {alice}) => {
// //
// //   const register_result = await alice.callSync('chat', 'register', {name: 'alice', avatar_url: ''})
// //   console.log(register_result)
// //   t.equal(register_result.Ok.length, 63)
// //
// //   const create_result = await alice.callSync('chat', 'create_stream', testNewChannelParams)
// //   console.log(create_result)
// //   t.deepEqual(create_result.Ok.length, 46)
// //
// //   const get_all_members_result = await alice.callSync('chat', 'get_members', {stream_address: create_result.Ok})
// //   console.log('all members:', get_all_members_result)
// //   let allMembers = get_all_members_result.Ok
// //   t.true(allMembers.length > 0, 'gets at least one member')
// //
// //   const get_result = await alice.callSync('chat', 'get_all_public_streams', {})
// //   console.log(get_result)
// //   t.deepEqual(get_result.Ok.length, 1)
// //
// // })
// //
// // scenarioBridge.runTape('Can post a message to the stream and retrieve', async (t, {alice}) => {
// //
// //   const register_result = await alice.callSync('chat', 'register', {name: 'alice', avatar_url: ''})
// //   console.log(register_result)
// //   t.equal(register_result.Ok.length, 63)
// //
// //   const create_result = await alice.callSync('chat', 'create_stream', testNewChannelParams)
// //   console.log(create_result)
// //   const stream_addr = create_result.Ok
// //   t.deepEqual(stream_addr.length, 46)
// //
// //   const get_result = await alice.callSync('chat', 'get_all_public_streams', {})
// //   console.log(get_result)
// //   t.deepEqual(get_result.Ok.length, 1)
// //
// //   const post_result = await alice.callSync('chat', 'post_message', {stream_address: stream_addr, message: testMessage})
// //   console.log(post_result)
// //   t.notEqual(post_result.Ok, undefined, 'post should return Ok')
// //
// //   const get_message_result = await alice.callSync('chat', 'get_messages', {address: stream_addr})
// //   console.log(get_message_result)
// //   t.deepEqual(get_message_result.Ok[0].entry.payload, testMessage.payload, 'expected to receive the message back')
// // })
// //
// // scenarioBridge.runTape('Can create a public stream with some members', async (t, {alice}) => {
// //
// //   const register_result = await alice.callSync('chat', 'register', {name: 'alice', avatar_url: ''})
// //   console.log(register_result)
// //   t.equal(register_result.Ok.length, 63)
// //
// //   const create_result = await alice.callSync('chat', 'create_stream', {...testNewChannelParams, public: false, initial_members: []})
// //   console.log(create_result)
// //   t.deepEqual(create_result.Ok.length, 46)
// //
// //   const get_all_members_result = await alice.callSync('chat', 'get_members', {stream_address: create_result.Ok})
// //   console.log('all members:', get_all_members_result)
// //   let allMemberAddrs = get_all_members_result.Ok
// //   t.true(allMemberAddrs.length > 0, 'gets at least one member')
// // })
//
//
// const testFieldSpec = {
//   name: "handle",
//   displayName: "Test Field",
//   required: true,
//   description: "",
//   usage: "STORE",
//   schema: ""
// }
//
// const testProfileSpec = {
//   name: "something",
//   sourceDna: "xxx",
//   fields: [testFieldSpec]
// }
//
// scenarioBridge.runTape('Registers the Profile Spec when there is no existing profile', async (t, {chat_instance, personas_instance}) => {
//   // const get_profile_result_1 = await chat_instance.callSync('chat', 'get_member_profile', {agent_address: 'HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3ui'})
//   // let sourceDna = get_profile_result_1.Err.Internal
//   // console.log('sourceDna ' + sourceDna)
//   //
//   // const get_profile_result_2 = await chat_instance.callSync('chat', 'get_member_profile', {agent_address: 'HcScjwO9ji9633ZYxa6IYubHJHW6ctfoufv5eq4F7ZOxay8wR76FP4xeG9pY3ui'})
//   // sourceDna = get_profile_result_2.Err.Internal
//   // console.log('sourceDna ' + sourceDna)
//
//
//   const register_result = await personas_instance.call("profiles", "register_app", {spec: testProfileSpec})
//   console.log(register_result)
//   t.notEqual(register_result.Ok, undefined)
//
//   const get_result = await personas_instance.call("profiles", "get_profiles", {})
//   console.log("Profiles" + JSON.stringify(get_result))
//   t.deepEqual(get_result.Ok.length, 1)
//
//   console.log(sourceDna)
//
// })
