// src/types.ts

export type NavItem = {
  label: string;
  href: string;
};

export type HeaderData = {
  logo: string;
  nav: NavItem[];
};

export type CtaLink = {
  label: string;
  href: string;
};

export interface PlatformStat {
  value: string;
  label: string;
  detail: string;
}

export interface HeroData {
  eyebrow: string;
  headline: string;
  description: string;
  primaryCta: CtaLink;
  secondaryCta: CtaLink;
  linkedin: string;
  github: string;
  platformStats: PlatformStat[];
}

export interface WorkItem {
  title: string;
  role: string;
  description: string;
  impact: string;
  tech: string[];
  link?: string;
  imageUrl?: string;
}

export interface WorkData {
  title: string;
  kicker: string;
  items: WorkItem[];
}

export interface TraceSpan {
  name: string;
  service: string;
  start: number;
  end: number;
  depth: number;
  status: 'ok' | 'active';
  detail: string;
}

export interface TraceData {
  title: string;
  kicker: string;
  description: string;
  spans: TraceSpan[];
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface OriginData {
  title: string;
  kicker: string;
  description: string[];
  stack: StackGroup[];
}

export interface StatusCheck {
  label: string;
  state: 'up' | 'down';
}

export interface StatusLink {
  type: string;
  label: string;
  href: string;
}

export interface StatusData {
  title: string;
  kicker: string;
  subheading: string;
  checks: StatusCheck[];
  primaryCta: CtaLink;
  links: StatusLink[];
  resume: CtaLink;
}

export interface FooterData {
  text: string;
}

export type ContentData = {
  metadata?: {
    title: string;
    description: string;
    url?: string;
  };
  header?: HeaderData;
  hero?: HeroData;
  work?: WorkData;
  trace?: TraceData;
  origin?: OriginData;
  status?: StatusData;
  footer?: FooterData;
};
