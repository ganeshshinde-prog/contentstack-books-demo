'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {  usePathname } from 'next/navigation';
import parse from 'html-react-parser';
// import Tooltip from './tool-tip';
import { onEntryChange } from '../contentstack-sdk';
import { getAllEntries, getHeaderRes } from '../helper';
import Skeleton from 'react-loading-skeleton';
import { HeaderProps, Entry, NavLinks, PageRef } from "../typescript/layout";
import { useCart } from "../contexts/cart-context";
import SearchBar from "./search-bar";

export default function Header() {
  const [header, setHeaderProp] = useState<HeaderProps | undefined>(undefined);
  const [entries, setEntries] = useState<Entry | undefined>(undefined);
  const pathname = usePathname();
  const [getHeader, setHeader] = useState(header);
  const { getCartCount } = useCart();

  const fetchHeaderAndEntries = async () => {
    const headerRes = await getHeaderRes();
    const entriesRes = await getAllEntries();
    setHeaderProp(headerRes);
    setEntries(entriesRes);
  }

  function buildNavigation(ent: Entry, hd: HeaderProps) {
    let newHeader={...hd};
    
    // Fix existing navigation items first
    if (newHeader.navigation_menu) {
      newHeader.navigation_menu = newHeader.navigation_menu.map((navItem) => {
        // Fix the New Arrivals URL if it's pointing to the wrong path
        if (navItem.label === 'New Arrivals' && 
            navItem.page_reference[0].url === '/new_arrivals/the-wheel-of-time') {
          return {
            ...navItem,
            page_reference: [
              { 
                ...navItem.page_reference[0],
                url: '/new_arrivals'
              }
            ] as [PageRef]
          };
        }
        return navItem;
      });
    }
    
    if (ent.length!== newHeader.navigation_menu.length) {
          ent.forEach((entry) => {
            const hFound = newHeader?.navigation_menu.find(
              (navLink: NavLinks) => navLink.label === entry.title
            );
            if (!hFound) {
              // Fix the New Arrivals URL to point to /new_arrivals instead of /new_arrivals/the-wheel-of-time
              let entryUrl = entry.url;
              if (entry.title === 'New Arrivals' && entry.url === '/new_arrivals/the-wheel-of-time') {
                entryUrl = '/new_arrivals';
              }
              
              newHeader.navigation_menu?.push({
                label: entry.title,
                page_reference: [
                  { title: entry.title, url: entryUrl, $: entry.$ },
                ] as [PageRef],
                $:{}
              });
            }
          });
    }
    
    // Add "Request New Book" link after "New Arrivals" if it doesn't exist
    const requestBookExists = newHeader.navigation_menu?.find(
      (navLink: NavLinks) => navLink.label === 'Request New Book'
    );
    
    if (!requestBookExists) {
      // Find the index of "New Arrivals" to insert "Request New Book" right after it
      const newArrivalsIndex = newHeader.navigation_menu?.findIndex(
        (navLink: NavLinks) => navLink.label === 'New Arrivals'
      );
      
      const requestBookLink = {
        label: 'Request New Book',
        page_reference: [
          { title: 'Request New Book', url: '/request-book', $: {} },
        ] as [PageRef],
        $: {}
      };
      
      if (newArrivalsIndex !== undefined && newArrivalsIndex >= 0) {
        // Insert right after "New Arrivals"
        newHeader.navigation_menu?.splice(newArrivalsIndex + 1, 0, requestBookLink);
      } else {
        // If "New Arrivals" not found, add at the end
        newHeader.navigation_menu?.push(requestBookLink);
      }
    }
    
    return newHeader
  }

  async function fetchData() {
    try {
      if (header && entries) {
      const headerRes = await getHeaderRes();
      const newHeader = buildNavigation(entries,headerRes)
      setHeader(newHeader);
    }
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchHeaderAndEntries();
  }, []);

  useEffect(() => {
    if (header && entries) {
      onEntryChange(() => fetchData());
    }
  }, [header]);
  const headerData = getHeader ? getHeader : undefined;
  
  return (
    <header className='header'>
      <div className='note-div'>
        {headerData?.notification_bar.show_announcement ? (
          typeof headerData.notification_bar.announcement_text === 'string' && (
            <div {...headerData.notification_bar.$?.announcement_text as {}}>
              {parse(headerData.notification_bar.announcement_text)}
            </div>
          )
        ) : (
          <Skeleton />
        )}
      </div>
      <div className='max-width header-div'>
        <div className='wrapper-logo'>
          <Link legacyBehavior href='/'>
            <a className='logo-tag' title='BookHaven'>
              <span className='site-name'>BookHaven</span>
            </a>
          </Link>
        </div>
        <input className='menu-btn' type='checkbox' id='menu-btn' />
        <label className='menu-icon' htmlFor='menu-btn'>
          <span className='navicon' />
        </label>
        <nav className='menu'>
          <ul className='nav-ul header-ul'>
            {headerData ? (
              headerData.navigation_menu.map((list) => {
                const className =
                  pathname === list.page_reference[0].url ? 'active' : '';
                return (
                  <li
                    key={list.label}
                    className='nav-li'
                    {...list.page_reference[0].$?.url as {}}
                  >
                    <Link legacyBehavior href={list.page_reference[0].url}>
                      <a className={className}>{list.label}</a>
                    </Link>
                  </li>
                );
              })
            ) : (
              <Skeleton width={300} />
            )}
          </ul>
        </nav>

        {/* Search Bar - Similar to Crossword website */}
        <div className='header-search'>
          <SearchBar />
        </div>

        {/* Sign In and Cart Section - Inspired by Crossword */}
        <div className='header-actions'>
          <div className='user-actions'>
            <Link 
              href='/sign-in'
              className='sign-in-btn'
            >
              <span className='user-icon'>👤</span>
              <span className='sign-in-text'>SIGN IN</span>
            </Link>
            <Link 
              href='/carts'
              className='cart-btn'
            >
              <span className='cart-icon'>🛒</span>
              <span className='cart-count'>{getCartCount()}</span>
            </Link>
          </div>
        </div>

        {/* <div className='json-preview'>
          <Tooltip content='JSON Preview' direction='top' dynamic={false} delay={200} status={0}>
            <span data-bs-toggle='modal' data-bs-target='#staticBackdrop'>
              <img src='/json.svg' alt='JSON Preview icon' />
            </span>
          </Tooltip>
        </div> */}
      </div>
    </header>
  );
}