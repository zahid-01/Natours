class Zhaid {
  constructor() {
    console.log('Object was created');
  }

  afunction() {
    console.log('A function was called');
    console.log(this);

    return this;
  }
}

const zahid1 = new Zhaid();
const th = zahid1.afunction();
console.log(zahid1 === th);
