// src/types.ts

export interface HeroData {
    greeting: string;
    name: string;
    description: string;
    linkedin: string;
    github: string;
    techStack: string[];
  }
  
  export interface AboutData {
    title: string;
    description: string[];
  }
  
  export interface Project {
    title: string;
    description: string;
    tech: string[];
    link?: string;
  }
  
  export interface ProjectsData {
    title: string;
    items: Project[];
  }
  
  export interface Website {
    title: string;
    description: string;
    tech: string[];
    url: string;
    imageUrl: string;
  }
  
  export interface WebsitesData {
    title: string;
    items: Website[];
  }
  
  export interface ContactLink {
    type: string;
    label: string;
    href: string;
  }
  
  export interface ContactData {
    heading: string;
    subheading: string;
    links: ContactLink[];
    resume: {
      label: string;
      href: string;
    };
  }
  
  export interface FooterData {
    text: string;
  }
  
  export type ContentData = {
    header?: HeaderData;
    hero?: HeroData;
    about?: AboutData;
    projects?: ProjectsData;
    websites?: WebsitesData;
    contact?: ContactData;
    footer?: FooterData;
  };

  export type HeaderData = {
    logo: string;
    nav: NavItem[];
  };
  
  export type NavItem = {
    label: string;
    href: string;
  };
  