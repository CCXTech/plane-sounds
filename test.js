async function test() {
    const { ETOPO5 } = await import('global-elevation');
    let etopo5 = new ETOPO5();
    let elevation = await etopo5.getElevation(-81.20819380065467, 29.4725396627256);
    let elevation2 = await etopo5.getElevation(-81.54641234865, 39.4725396627256);
    let elevation3 = await etopo5.getElevation(-71.20819380065467, 59.4725396627256);
    let elevation4 = await etopo5.getElevation(-80.20819380065467, 19.4725396627256);
    let elevation5 = await etopo5.getElevation(-82.20819380065467, 28.4725396627256);
    console.log(elevation);
    console.log(elevation2);
    console.log(elevation3);
    console.log(elevation4);
    console.log(elevation5);
}

test();

