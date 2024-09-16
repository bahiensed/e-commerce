'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { Footer, Media } from '../../../../payload/payload-types'
import { inclusions, noHeaderFooterUrls } from '../../../constants'
import { Button } from '../../Button'
import { Gutter } from '../../Gutter'

import classes from './index.module.scss'

const FooterComponent = ({ footer }: { footer?: Footer }) => {
  const pathname = usePathname()

  // If footer or navItems are not available, do not render the footer
  if (!footer || !footer.navItems) {
    return null // Exit early if footer or navItems is null/undefined
  }

  const navItems = footer.navItems || [] // Fallback to empty array if navItems is undefined

  return (
    <footer className={noHeaderFooterUrls.includes(pathname) ? classes.hide : ''}>
      <Gutter>
        <ul className={classes.inclusions}>
          {inclusions.map(inclusion => (
            <li key={inclusion.title}>
              <Image
                src={inclusion.icon}
                alt={inclusion.title}
                width={36}
                height={36}
                className={classes.icon}
              />
              <h5 className={classes.title}>{inclusion.title}</h5>
              <p>{inclusion.description}</p>
            </li>
          ))}
        </ul>
      </Gutter>

      <div className={classes.footer}>
        <Gutter>
          <div className={classes.wrap}>
            <Link href="/">
              <Image src="/logo-white.svg" alt="logo" width={170} height={50} />
            </Link>

            {/* Add fallback for footer.copyright */}
            <p>{footer.copyright || '© Rumor by Lisa Nunes, 2024'}</p>

            <div className={classes.socialLinks}>
              {navItems.length > 0 ? ( // Only map over navItems if it's not empty
                navItems.map(item => {
                  const icon = item?.link?.icon as Media

                  return (
                    <Button
                      key={item.link.label}
                      el="link"
                      href={item.link.url}
                      newTab={true}
                      className={classes.SocialLinkItem}
                    >
                      <Image
                        src={icon?.url || '/default-icon.svg'} // Provide a fallback for the icon URL
                        alt={item.link.label}
                        width={24}
                        height={24}
                        className={classes.socialIcon}
                      />
                    </Button>
                  )
                })
              ) : (
                <p>No social links available</p> // Fallback if navItems is empty
              )}
            </div>
          </div>
        </Gutter>
      </div>
    </footer>
  )
}

export default FooterComponent
