varying vec2 vUv;
varying vec3 vColor;

uniform sampler2D tHeightMap;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;

void main( void ) {


	vec4 heightColor = texture2D( tHeightMap, vUv);

	vec3 fireSumColor = mix( uColor1,uColor2,vUv.y);
	vec3 fireSumColor2 = mix( fireSumColor, uColor3,vUv.y );

    if( vColor.r <= 0.0 ) {
        gl_FragColor = vec4( vColor,0.0 );
    }
    else {
        gl_FragColor = vec4(fireSumColor2,1.0);
    }

}