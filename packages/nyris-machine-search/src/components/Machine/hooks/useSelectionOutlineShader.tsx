import React from 'react';
// @ts-ignore
import * as THREE from 'three';

const fragmentShader = `#define GLSLIFY 1
#include <common>
uniform bool uShouldSelect;
uniform vec3 iResolution;
uniform float iTime;
uniform sampler2D iChannel0;
uniform sampler2D iChannel1;
uniform sampler2D shadowSaved;
uniform vec3 uSelectionColor;

varying vec2 vUv;

#define Sensitivity (vec2(0.3, 1.5) * iResolution.y / 400.0)

float checkSame(vec4 center, vec4 samplef)
{
    vec2 centerNormal = center.xy;
    float centerDepth = center.z;
    vec2 sampleNormal = samplef.xy;
    float sampleDepth = samplef.z;
    
    vec2 diffNormal = abs(centerNormal - sampleNormal) * Sensitivity.x;
    bool isSameNormal = (diffNormal.x + diffNormal.y) < 0.1;
    float diffDepth = abs(centerDepth - sampleDepth) * Sensitivity.y;
    bool isSameDepth = diffDepth < 0.1;
    
    return (isSameNormal && isSameDepth) ? 1.0 : 0.0;
}


//add uniform for "should show selection" which will switch entire thing on
//if false, it will bypass shader and send rendertarget back through output
//alternatively it can be used in useframe to turn off composer altogether

//use two duplicate scenes with one to render target, since single scene seems difficult to manipulate

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
    // vec4 sample0 = texture2D(iChannel0, fragCoord / iResolution.xy);
    // vec4 sample1 = texture2D(iChannel0, (fragCoord + vec2(1.0, 1.0)) / iResolution.xy);
    // vec4 sample2 = texture2D(iChannel0, (fragCoord + vec2(-1.0, -1.0)) / iResolution.xy);
    // vec4 sample3 = texture2D(iChannel0, (fragCoord + vec2(-1.0, 1.0)) / iResolution.xy);
    // vec4 sample4 = texture2D(iChannel0, (fragCoord + vec2(1.0, -1.0)) / iResolution.xy);
    
    // float edge = checkSame(sample1, sample2) * checkSame(sample3, sample4);
    // float shadow = texture2D(shadowSaved,fragCoord / iResolution.xy).x;
    // fragColor = vec4(edge, shadow, 1.0, 1.0);
    // fragColor = vec4(1.0,1.0,0.0,1.0);
    // fragColor = texture2D(shadowSaved,vUv);
    fragColor = texture2D(iChannel0,fragCoord/iResolution.xy);
}

// float lengthOfRender(vec4 rawRender){
//     float lengthValue = sqrt(rawRender.x*rawRender.x + rawRender.y*rawRender.y+rawRender.z*rawRender.z)
//     return lengthValue;
// }

vec4 getSelectionHightlight(float outlineThickness){
    vec4 newOutline = vec4(1.,0.5,0.,1.);
    vec4 black = vec4(0.,0.,0.,1.);
    vec4 white = vec4(1.,1.,1.,1.);
    float widthPixelSize = 1./iResolution.x;
    float heightPixelSize = 1./iResolution.y;
    // if(length(rawRender.rgb) <0.1){
    //     newOutline = vec4(1.,0.,0.,1.);
    // }
    vec4 rawRender = texture2D(iChannel0,vUv);
    vec4 nL = texture2D(iChannel0,vec2(vUv.x - outlineThickness *  widthPixelSize,vUv.y));
    vec4 nR = texture2D(iChannel0,vec2(vUv.x + outlineThickness * widthPixelSize,vUv.y));
    vec4 nT = texture2D(iChannel0,vec2(vUv.x,vUv.y + outlineThickness * heightPixelSize));
    vec4 nB = texture2D(iChannel0,vec2(vUv.x,vUv.y - outlineThickness * heightPixelSize));
    vec4 nTL = texture2D(iChannel0,vec2(vUv.x - outlineThickness * widthPixelSize ,vUv.y + outlineThickness *  heightPixelSize));
    vec4 nTR = texture2D(iChannel0,vec2(vUv.x + outlineThickness * widthPixelSize ,vUv.y + outlineThickness * heightPixelSize));
    vec4 nBL = texture2D(iChannel0,vec2(vUv.x - outlineThickness * widthPixelSize ,vUv.y - outlineThickness * heightPixelSize));
    vec4 nBR = texture2D(iChannel0,vec2(vUv.x + outlineThickness * widthPixelSize ,vUv.y - outlineThickness * heightPixelSize));

    if((nL == nR) && (nT == nB) && (nTL == nBR) && (nBL == nTR) && (nTR == rawRender)){
        return black;//rawRender;
    }else {
        return white;//newOutline;
        }
}
     
    void main() {
      mainImage(gl_FragColor, gl_FragCoord.xy);

      // mainImage(gl_FragColor, vUv*iResolution.xy);
    //   vec4 selectionColor = vec4(1.,0.5,0.,1.);
      vec4 selectionColor = vec4(uSelectionColor,1.0);
      // vec4 selectionColor = vec4(uSelectionColor,1.0);
      vec4 mask = getSelectionHightlight(1.);
      vec4 trueColors = texture2D(iChannel1,vUv);
      if(!uShouldSelect){
        mask = vec4(0.,0.,0.,1.);
      }

      gl_FragColor = mix(trueColors,selectionColor, mask);
      // gl_FragColor = texture2D(iChannel0,vUv);
    }
    `;

const vertexShader = `#define GLSLIFY 1
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

`;

export default function useSelectionOutlineShader(canvas: any) {
  const loader = new THREE.TextureLoader();
  const texture = loader.load('/bayer.png');
  const textureNoise = loader.load('/noise.png');

  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const normalOutlineColor = new THREE.Color('rgb(255,200,0)');

  let uSelectionColor = {
    value: normalOutlineColor,
  };

  const uniforms = {
    iTime: { value: 0 },
    iResolution: { value: new THREE.Vector3() },
    iChannel0: { value: texture },
    iChannel1: { value: textureNoise },
    uSelectionColor: uSelectionColor,
  };
  uniforms.iResolution.value.set(canvas.width, canvas.height, 1);

  const selectionOutlineShader = new THREE.ShaderMaterial({
    fragmentShader,
    uniforms,
    vertexShader,
  });

  return selectionOutlineShader;
}
