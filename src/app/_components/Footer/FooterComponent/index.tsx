/* eslint-disable no-console */
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

  console.log('Footer data:', footer)

  // Fallback footer content if footer data is null
  if (!footer) {
    console.warn('Footer data is null, using fallback') // eslint-disable-line no-console
    footer = {
      id: 'default-footer-id', // Add a default id
      copyright: '© Default Company, 2024',
      navItems: [], // You can provide some default items or leave it empty
    }
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

            <p>{footer.copyright}</p>

            <div className={classes.socialLinks}>
              {navItems.length > 0 ? (
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
                <p>No social links available</p>
              )}
            </div>
          </div>
        </Gutter>
      </div>
    </footer>
  )
}

export default FooterComponent
