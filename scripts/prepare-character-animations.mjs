// Bake source motions onto Black Death; textures are not needed for retargeting.
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { AnimationClip, AnimationMixer, Quaternion, QuaternionKeyframeTrack, Vector3, VectorKeyframeTrack } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { prepareCharacterRig } from '../src/utils/characterRig.js';

globalThis.ProgressEvent ??= class {};
const models = new URL('../public/assets/models/', import.meta.url);
async function loadRig(name) {
  const bytes = await fs.readFile(new URL(name, models));
  const length = bytes.readUInt32LE(12);
  const json = JSON.parse(bytes.subarray(20, 20 + length));
  json.buffers[0].uri = `data:application/octet-stream;base64,${bytes.subarray(28 + length).toString('base64')}`;
  delete json.images;
  delete json.textures;
  delete json.extensionsUsed;
  delete json.extensionsRequired;
  json.materials = [];
  json.meshes.forEach(mesh => mesh.primitives.forEach(primitive => delete primitive.material));
  return new GLTFLoader().parseAsync(JSON.stringify(json), '');
}
function bindPose(scene) {
  prepareCharacterRig(scene);
}
const target = await loadRig('black_death_rigged.glb');
const fbx = await fs.readFile(new URL('Old Man Idle.fbx', models));
const oldMan = new FBXLoader().parse(fbx.buffer.slice(fbx.byteOffset, fbx.byteOffset + fbx.byteLength), '');

function bake(source, clip, name, getSourceName, loop) {
  bindPose(target.scene);
  bindPose(source);
  const pairs = [];
  // Traversal order ensures that parents are updated before children.
  target.scene.traverse(bone => {
    if (!bone.isBone) return;
    const semantic = bone.name.replace(/_0\d+$/, '');
    const sourceName = getSourceName(semantic);
    const from = sourceName && source.getObjectByName(sourceName);
    if (!from) return;
    pairs.push({ bone, from, semantic, rest: bone.getWorldQuaternion(new Quaternion()),
      inverseSourceRest: from.getWorldQuaternion(new Quaternion()).invert(), values: [] });
  });
  if (pairs.length < 18) throw new Error(`${name}: insufficient mapped joints (${pairs.length})`);
  const hips = pairs.find(pair => pair.semantic === 'Hips');
  const targetHipRest = hips.bone.getWorldPosition(new Vector3());
  const sourceHipRest = hips.from.getWorldPosition(new Vector3());
  const foot = pairs.find(pair => pair.semantic === 'LeftFoot');
  const ratio = targetHipRest.distanceTo(foot.bone.getWorldPosition(new Vector3())) /
    sourceHipRest.distanceTo(foot.from.getWorldPosition(new Vector3()));
  const mixer = new AnimationMixer(source);
  mixer.clipAction(clip).play();
  const times = [], positions = [];
  const frames = Math.ceil(clip.duration * 30);
  const world = new Quaternion(), parent = new Quaternion();
  const displacement = new Vector3();
  for (let i = 0; i <= frames; i++) {
    const time = i * clip.duration / frames;
    times.push(time);
    mixer.setTime(Math.min(time, clip.duration - 0.00001));
    source.updateMatrixWorld(true);
    for (const pair of pairs) {
      pair.from.getWorldQuaternion(world).multiply(pair.inverseSourceRest).multiply(pair.rest);
      pair.bone.parent.getWorldQuaternion(parent).invert();
      pair.bone.quaternion.copy(parent.multiply(world)).normalize();
      if (pair === hips) {
        displacement.copy(pair.from.getWorldPosition(new Vector3())).sub(sourceHipRest).multiplyScalar(ratio);
        // Keep the character at its room anchor; preserve vertical motion only.
        displacement.x = displacement.z = 0;
        pair.bone.position.copy(pair.bone.parent.worldToLocal(displacement.add(targetHipRest)));
        positions.push(...pair.bone.position.toArray());
      }
      pair.bone.updateMatrixWorld(true);
      pair.values.push(...pair.bone.quaternion.toArray());
    }
  }
  // Blend the last 0.25 seconds into the first pose for a seamless idle loop.
  if (loop) {
    const first = new Quaternion(), current = new Quaternion();
    for (let i = 0; i <= frames; i++) {
      const alpha = Math.max(0, (times[i] - (clip.duration - 0.25)) / 0.25);
      if (!alpha) continue;
      for (const pair of pairs) {
        first.fromArray(pair.values, 0);
        current.fromArray(pair.values, i * 4).slerp(first, alpha).toArray(pair.values, i * 4);
      }
      for (let axis = 0; axis < 3; axis++) positions[i * 3 + axis] += (positions[axis] - positions[i * 3 + axis]) * alpha;
    }
  }
  const tracks = pairs.map(pair => new QuaternionKeyframeTrack(`${pair.bone.name}.quaternion`, times, pair.values));
  tracks.push(new VectorKeyframeTrack(`${hips.bone.name}.position`, times, positions));
  for (const track of tracks) if (!Array.from(track.values).every(Number.isFinite)) throw new Error(`Invalid track: ${track.name}`);
  mixer.stopAllAction();
  mixer.uncacheRoot(source);
  console.log(`${name}: ${pairs.length} joints, ${clip.duration.toFixed(2)}s, ${frames + 1} samples`);
  return AnimationClip.toJSON(new AnimationClip(name, clip.duration, tracks).optimize());
}
const clips = [
  bake(oldMan, oldMan.animations[0], 'Old Man Idle', name => `mixamorig${name}`, true),
];
const output = new URL('../public/assets/animations/black-death.json', import.meta.url);
await fs.mkdir(new URL('.', output), { recursive: true });
await fs.writeFile(output, JSON.stringify(clips));
console.log(fileURLToPath(output));
