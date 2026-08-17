interface Project {
  title: string
  description: string
  href?: string
  imgSrc?: string
}

const projectsData: Project[] = [
  {
    title: 'TaleWiz',
    description: `Creates fully illustrated, personalized children's storybooks in minutes. Parents pick their child's traits and an adventure — dragons, pirates, enchanted forests — and TaleWiz generates a unique 7-page story with the child as the hero, in one of nine illustration styles, ready to download as a print-ready PDF.`,
    imgSrc: '/static/images/talewiz.png',
    href: 'https://talewiz.com/',
  },
  {
    title: 'Coolorea',
    description: `A free coloring pages website for kids, with over 1,900 printable drawings across 42 categories (unicorns, dinosaurs, princesses, cars, and more). No sign-up, no ads — instant download and print. Also offers personalized illustrated stories.`,
    imgSrc: '/static/images/coolorea.png',
    href: 'https://coolorea.com/',
  },
  {
    title: 'Mossaik',
    description: `This project started as a remake of WickedBackgrounds, but it turned into a full featured design tool. It's a design tool to create patterns, waves, blobs and other shapes.`,
    imgSrc: '/static/images/mossaik.png',
    href: 'https://mossaik.app/',
  },
  {
    title: 'Oxbow UI',
    description: `Collection of HTML blocks to build pages and apps faster. The blocks are done with Tailwind CSS, which makes easy to copy and paste the blocks. All the blocks are design by Mike Andreuzza and I've worked adding authentication, security and tweaks.`,
    imgSrc: '/static/images/oxbow.png',
    href: 'https://oxbowui.com/',
  },
  {
    title: 'Wicked Backgrounds',
    description: `This is a small side project I did to generate svg backgrounds. it's been featured on many websites like Codrops, Speckyboy or even in CSS-Tricks. UI design done by Mike Andreuzza.`,
    imgSrc: '/static/images/wickedbackgrounds.png',
    href: 'https://www.wickedbackgrounds.com',
  },
]

export default projectsData
