import { useRef } from 'react';
import styled from 'styled-components';
import { confirmPopup } from 'primereact/confirmpopup';


const Link = styled.a`
    background: #178CCF;
    background: linear-gradient(to right, #ffffffff 0%, #ffffffff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-decoration: underline;
    word-break: break-all;
    cursor: pointer;
    
    &:hover {
        background: #178CCF;
        background: linear-gradient(to right, #0699eeff 0%, #0011ffff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        // text-shadow: 0px 0px 7px #0ab1fe81;
        text-decoration: none;
    }
`;

const TextContainer = styled.span`
  white-space: pre-line;
  word-break: break-word;
  line-height: 1.6;
`;

const AutoLink = ({ text, className = '' }) => {
  const linkRef = useRef(null);
  const currentUrlRef = useRef('');

  const delimiter = /((?:https?:\/\/)?(?:(?:[a-z0-9]?(?:[a-z0-9\-]{1,61}[a-z0-9])?\.[^\.|\s])+[a-z\.]*[a-z]+|(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3})(?::\d{1,5})*[a-z0-9.,_\/~#&=;%+?\-\\(\\)]*)/gi;

  const handleLinkClick = (event, url) => {
    event.preventDefault();
    currentUrlRef.current = url;
    confirmPopup({
      target: event.currentTarget,
      message: `Are you sure you want to open this external link?`,
      icon: 'pi pi-external-link',
      acceptClassName: 'p-button-warning',
      accept: () => {
        window.open(url, '_blank', 'noopener,noreferrer');
      },
      reject: () => {
        // Użytkownik anulował
      }
    });
  };

  return (
    <TextContainer className={className}>
      {/* <ConfirmPopup /> */}
      {text.split(delimiter).map((word, index) => {
        const match = word.match(delimiter);
        if (match) {
          const url = match[0];
          const fullUrl = url.startsWith('http') ? url : `http://${url}`;
          
          return (
            <Link
              key={index}
              ref={linkRef}
              href={fullUrl}
              onClick={(e) => handleLinkClick(e, fullUrl)}
              rel="noopener noreferrer"
            >
              {url}
            </Link>
          );
        }
        return word;
      })}
    </TextContainer>
  );
};

export default AutoLink;