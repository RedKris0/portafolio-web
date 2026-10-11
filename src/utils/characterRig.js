import { Quaternion, Vector3 } from 'three';

// Imported FBX rigs may have a Z-up bind pose inside a Y-up GLB scene.
// Align the rig before retargeting and use the same reference pose at runtime.
export function prepareCharacterRig(scene) {
  const rigs = new Set();
  scene.traverse(node => { if (node.isSkinnedMesh) rigs.add(node.skeleton); });
  rigs.forEach(rig => rig.pose());
  scene.updateMatrixWorld(true);
  const hips = scene.getObjectByName('Hips_01') || scene.getObjectByName('Hip_Bn_03');
  const head = scene.getObjectByName('Head_06') || scene.getObjectByName('Head_Bn_033');
  const root = scene.getObjectByName('_rootJoint');
  if (hips && head && root) {
    const up = head.getWorldPosition(new Vector3()).sub(hips.getWorldPosition(new Vector3())).normalize();
    const correction = new Quaternion().setFromUnitVectors(up, new Vector3(0, 1, 0));
    const parent = root.parent.getWorldQuaternion(new Quaternion());
    root.quaternion.premultiply(parent.clone().invert().multiply(correction).multiply(parent));
    scene.updateMatrixWorld(true);
  }
  rigs.forEach(rig => rig.update());
  scene.traverse(node => {
    if (node.isSkinnedMesh) {
      node.computeBoundingBox();
      node.computeBoundingSphere();
    }
  });
}
