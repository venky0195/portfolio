import { FooterData } from '../types';

type Props = {
  data: FooterData;
};

export default function Footer({ data }: Props) {
  return (
    <footer className='relative z-10 border-t border-border px-6 py-8 text-center text-sm text-foreground-muted'>
      <p>
        © {new Date().getFullYear()} {data.text}
      </p>
    </footer>
  );
}
