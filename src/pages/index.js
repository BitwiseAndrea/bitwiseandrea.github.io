import * as React from "react";
import './pageStyles.css';

// data
const links = [
  {
    text: "Tutorial",
    url: "https://www.gatsbyjs.com/docs/tutorial/",
    description:
      "A great place to get started if you're new to web development. Designed to guide you through setting up your first Gatsby site.",

      background: 'linear-gradient(180deg, rgb(223 76 255), #5863d4)'
  },
  {
    text: "How to Guides",
    url: "https://www.gatsbyjs.com/docs/how-to/",
    description:
      "Practical step-by-step guides to help you achieve a specific goal. Most useful when you're trying to get something done.",

      background: 'linear-gradient(180deg, rgb(223 76 255), #5863d4)'
  },
  {
    text: "Reference Guides",
    url: "https://www.gatsbyjs.com/docs/reference/",
    description:
      "Nitty-gritty technical descriptions of how Gatsby works. Most useful when you need detailed information about Gatsby's APIs.",

      background: 'linear-gradient(180deg, rgb(223 76 255), #5863d4)'
  },
  {
    text: "Conceptual Guides",
    url: "https://www.gatsbyjs.com/docs/conceptual/",
    description:
      "Big-picture explanations of higher-level Gatsby concepts. Most useful for building understanding of a particular topic.",

      background: 'linear-gradient(180deg, rgb(223 76 255), #5863d4)'
  },
  {
    text: "Plugin Library",
    url: "https://www.gatsbyjs.com/plugins",
    description:
      "Add functionality and customize your Gatsby site or app with thousands of plugins built by our amazing developer community.",

      background: 'linear-gradient(180deg, rgb(223 76 255), #5863d4)'
  },
  {
    text: "Plugin Nothingness",
    url: "https://www.gatsbyjs.com/kjaskjldfalk",
    description:
      "Add functionality and customize your Gatsby site or app with thousands of plugins built by our amazing developer community.",

      background: 'linear-gradient(180deg, rgb(223 76 255), #5863d4)'
  }
]

// markup
const IndexPage = () => {
  return (
    <main className='page'>
      <title>Home Page</title>
      <div className='header'>
        <div className='upperSection'>
          <p className='paragraph'>
            <span role="img" aria-label="Sunglasses smiley emoji">
              😎
            </span>
          </p>
        </div>

        <div className='grid'>
            {links.map(link => (
              <div key={link.url} className='listItem' style={{ background: link.background }}>
                <span>
                  <a
                    className='link'
                    href={`${link.url}?utm_source=starter&utm_medium=start-page&utm_campaign=minimal-starter`}
                  >
                    {link.text}
                  </a>
                  <p className='description'>{link.description}</p>
                </span>
              </div>
            ))}
        </div>
        <div className='headerMask' />
      </div>

      <div className='footer'>
        <div className='footerMask' />
      </div>
    </main>
  )
}

export default IndexPage
