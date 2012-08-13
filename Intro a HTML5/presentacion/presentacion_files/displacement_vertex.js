uniform float time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vColor;

uniform sampler2D tHeightMap;
uniform float uDisplacementScale;

const float PI = 3.14159265;

float circEaseInOut (float t, float b, float c, float d) {
	if ((t/=d/2.0) < 1.0) return -c/2.0 * (sqrt(1.0 - t*t) - 1.0) + b;
	return c/2.0 * (sqrt(1.0 - (t-=2.0)*t) + 1.0) + b;
}

float expoEaseInOut (float t, float b, float c, float d) {
	if (t<=0.0) return b;
	if (t==d) return b+c;
	if ((t/=d/2.0) < 1.0) return c/2.0 * pow(2.0, 10.0 * (t - 1.0)) + b;
	return c/2.0 * (-pow(2.0, -10.0 * --t) + 2.0) + b;
}

void main( void ) {

	vUv = uv;
    vColor = color;
	vNormal = normalize( normalMatrix * normal );

	vec3 scaledPosition = position.xyz;
	scaledPosition.z = scaledPosition.z * (1.0+(sin(time)+1.0)/2.0*0.4);

	float easeVal = expoEaseInOut(vUv.y,0.2,1.0,1.0);

	float dvX = texture2D( tHeightMap, vec2(0,(vUv.y+0.5)/2.0) ).x - 0.5;
	float dvY = texture2D( tHeightMap, vec2(0.7,(vUv.y+0.5)/2.0) ).x - 0.5;
	vec4 df = vec4(uDisplacementScale * dvX, uDisplacementScale * dvY , 0.0,0.0)*vUv.y;
	vec4 displacedPosition = df + vec4(scaledPosition,1.0);

    float distance = length( -displacedPosition );
    if( distance < 100.0 )
        vColor = vec3(1.0,0.0,.0);
    else
        vColor = vec3(0.0,0.0,0.0);

	vec4 mPosition = objectMatrix * displacedPosition;
	vec4 mvPosition = viewMatrix * mPosition;

	//change matrix

	gl_Position = projectionMatrix * mvPosition;


}