import * as React from "react"
import AndreaPhoto from "../images/IMG_4389.jpg"
import FernPhoto from "../images/ferns.png"

// styles
const pageStyles = {
  fontFamily: "-apple-system, fantasy",
  backgroundImage: 'url(' + FernPhoto + ')'
}

const upperSectionStyles = {
  borderRadius: '8px',
  padding: '16px',
  margin: '36px',
  background: 'linear-gradient(rgb(206 175 103 / 80%), rgb(84 192 159 / 80%))'
}

const gridStyles = {
  display: 'grid',
  gridTemplate: 'auto / auto auto auto'
}

const paragraphStyles = {
  marginBottom: 48,
}
const codeStyles = {
  color: "#8A6534",
  padding: 4,
  backgroundColor: "#FFF4DB",
  fontSize: "1.25rem",
  borderRadius: 4,
}

const listItemStyles = {
  fontWeight: "300",
  fontSize: "24px",
  borderRadius: '8px',
  padding: '16px',
  margin: '36px'
}

const footerStyles = {
  backgroundImage: 'url(' + AndreaPhoto + ')',
  backgroundSize: 'contain',
  width: '100%',
  paddingTop: '67%',
  position: 'relative'
}

const footerMaskStyles = {
  width: '100%',
  height: '100%',
  position: 'absolute',
  height: '25%',
  top: 0,
  background: 'linear-gradient(0, transparent, black)'
}

const linkStyle = {
  color: "#000000",
  fontWeight: "bold",
  fontSize: "16px",
  verticalAlign: "5%",
}

const descriptionStyle = {
  fontSize: "14px",
}

// data
const links = [
  {
    text: "Tutorial",
    url: "https://www.gatsbyjs.com/docs/tutorial/",
    description:
      "A great place to get started if you're new to web development. Designed to guide you through setting up your first Gatsby site.",

      background: 'linear-gradient(180deg, rgb(223 76 255 / 80%), #5863d4)'
  },
  {
    text: "How to Guides",
    url: "https://www.gatsbyjs.com/docs/how-to/",
    description:
      "Practical step-by-step guides to help you achieve a specific goal. Most useful when you're trying to get something done.",

      background: 'linear-gradient(180deg, rgb(223 76 255 / 80%), #5863d4)'
  },
  {
    text: "Reference Guides",
    url: "https://www.gatsbyjs.com/docs/reference/",
    description:
      "Nitty-gritty technical descriptions of how Gatsby works. Most useful when you need detailed information about Gatsby's APIs.",

      background: 'linear-gradient(180deg, rgb(223 76 255 / 80%), #5863d4)'
  },
  {
    text: "Conceptual Guides",
    url: "https://www.gatsbyjs.com/docs/conceptual/",
    description:
      "Big-picture explanations of higher-level Gatsby concepts. Most useful for building understanding of a particular topic.",

      background: 'linear-gradient(180deg, rgb(223 76 255 / 80%), #5863d4)'
  },
  {
    text: "Plugin Library",
    url: "https://www.gatsbyjs.com/plugins",
    description:
      "Add functionality and customize your Gatsby site or app with thousands of plugins built by our amazing developer community.",

      background: 'linear-gradient(180deg, rgb(223 76 255 / 80%), #5863d4)'
  },
  {
    text: "Plugin Nothingness",
    url: "https://www.gatsbyjs.com/kjaskjldfalk",
    description:
      "Add functionality and customize your Gatsby site or app with thousands of plugins built by our amazing developer community.",

      background: 'linear-gradient(180deg, rgb(223 76 255 / 80%), #5863d4)'
  }
]

// markup
const IndexPage = () => {
  return (
    <main style={pageStyles}>
      <title>Home Page</title>
      <div style={upperSectionStyles}>
        <p style={paragraphStyles}>
          Edit <code style={codeStyles}>src/pages/index.js</code> to see this page
          update in real-time.{" "}
          <span role="img" aria-label="Sunglasses smiley emoji">
            😎
          </span>
        </p>
      </div>

      <div style={gridStyles}>
          {links.map(link => (
            <div key={link.url} style={{ ...listItemStyles, background: link.background }}>
              <span>
                <a
                  style={linkStyle}
                  href={`${link.url}?utm_source=starter&utm_medium=start-page&utm_campaign=minimal-starter`}
                >
                  {link.text}
                </a>
                <p style={descriptionStyle}>{link.description}</p>
              </span>
            </div>
          ))}
      </div>

      <div style={footerStyles}>
        <div style={footerMaskStyles} />
      </div>
    </main>
  )
}

export default IndexPage
