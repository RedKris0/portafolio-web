import { Color, SRGBColorSpace } from 'three';

// The source GLB stores its diffuse maps in a retired glTF extension.
// Restore these maps using metallic/roughness materials (all source specular factors are zero).
export function registerCharacterMaterials(loader) {
  loader.register(parser => ({
    name: 'KHR_materials_pbrSpecularGlossiness',
    extendMaterialParams(index, params) {
      const extension = parser.json.materials[index].extensions?.KHR_materials_pbrSpecularGlossiness;
      if (!extension) return Promise.resolve();
      const color = extension.diffuseFactor || [1, 1, 1, 1];
      params.color = new Color().fromArray(color);
      params.opacity = color[3];
      params.metalness = 0;
      params.roughness = 1 - (extension.glossinessFactor || 0);
      return extension.diffuseTexture
        ? parser.assignTexture(params, 'map', extension.diffuseTexture, SRGBColorSpace)
        : Promise.resolve();
    },
  }));
}
