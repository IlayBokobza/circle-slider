import { CircleCarousel, } from './circleImageCarousel'
import './style.css'



new CircleCarousel("#circle", {
  forceImageToFit: true,
  items: [
    {
      img: "/public/img1.jpg",
      category: "paraents"
    },
    {
      img: "/public/img2.jpg",
      category: "house"
    },
    {
      img: "/public/img3.jpg",
      category: "view"
    },
    {
      img: "/public/img4.jpeg",
      category: "tree"
    },
    {
      img: "/public/img5.jpeg",
      category: "vilage"
    },
    {
      img: "/public/img6.jpg",
      category: "watch"
    }
  ]
})
