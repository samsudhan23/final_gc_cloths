

// function showAlert() {
//  particlesJS("particles-js", {
//   particles: {
//     number: {
//       value: 180,
//       density: {
//         enable: true,
//         value_area: 800,
//       },
//     },
//     color: {
//       value: "#fff",
//     },
//     shape: {
//       type: "circle",
//     },
//     opacity: {
//       value: 0.3,
//       random: false,
//       anim: {
//         enable: false,
//         speed: 4,
//         opacity_min: 0.1,
//         sync: false,
//       },
//     },
//     size: {
//       value: 4,
//       random: true,
//       anim: {
//         enable: true,
//         speed: 2,
//         size_min: 0.1,
//         sync: false,
//       },
//     },
//     line_linked: {
//       enable: false,
//     },
//     move: {
//       enable: true,
//       speed: 0.4,
//       direction: "right",
//       random: true,
//       straight: false,
//       out_mode: "none",
//       bounce: false,
//       attract: {
//         enable: false,
//         rotateX: 600,
//         rotateY: 1200,
//       },
//     },
//   },
//   retina_detect: true,
// });
// }

function showAlert() {
  if (typeof particlesJS === 'undefined') {
    console.error('particlesJS not loaded!');
    return;
  }
particlesJS("particles-js", {
  particles: {
    number: { value: 180, density: { enable: true, value_area: 800 } },
    color: { value: "#000000" },
    shape: { type: "circle" },
    opacity: { value: 2 },
    size: {
      value: 3,
      random: true,
      anim: { enable: true, speed: 2, size_min: 0.1, sync: false },
    },
    line_linked: { enable: false },
    move: {
      enable: true,
      speed: 0.4,
      direction: "right",
      random: true,
      straight: false,
      out_mode: "none",
      bounce: true,
    },
  },
  retina_detect: true,
});

  // Dot dot
  //   particlesJS("particles-js", {
  //   particles: {
  //     number: {
  //       value: 180,
  //       density: {
  //         enable: true,
  //         value_area: 800,
  //       },
  //     },
  //     color: {
  //       value: "#fff",
  //     },
  //     shape: {
  //       type: "circle",
  //     },
  //     opacity: {
  //       value: 0.3,
  //       random: false,
  //       anim: {
  //         enable: false,
  //         speed: 4,
  //         opacity_min: 0.1,
  //         sync: false,
  //       },
  //     },
  //     size: {
  //       value: 4,
  //       random: true,
  //       anim: {
  //         enable: true,
  //         speed: 2,
  //         size_min: 0.1,
  //         sync: false,
  //       },
  //     },
  //     line_linked: {
  //       enable: false,
  //     },
  //     move: {
  //       enable: true,
  //       speed: 0.4,
  //       direction: "right",
  //       random: true,
  //       straight: false,
  //       out_mode: "none",
  //       bounce: false,
  //       attract: {
  //         enable: false,
  //         rotateX: 600,
  //         rotateY: 1200,
  //       },
  //     },
  //   },
  //   retina_detect: true,
  // });
}
