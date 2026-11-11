// Video descriptions are HTML. They often refer to videos, mylists, series,
// users and illustrations by id, as plain text, so those references become links.
import { htmlToText } from 'html-to-text';
import { illustrationUrl, mylistUrl, seriesUrl, userUrl, videoUrl, watchUrl } from './urls.js';

const markdownLink = (text, url) => `[${text}](${url})`;

// The id pattern of each reference type, with the id in the first group,
// and where the id leads.
//
// Minimum lengths avoid accidental matches, such as the microphone SM58.
// Series ids are shorter than the others; 4 digits are common.
const REFERENCE_TYPES = [
  [String.raw`(sm\d{5,})`, videoUrl],
  [String.raw`(nm\d{5,})`, videoUrl],
  [String.raw`(so\d{5,})`, watchUrl],
  [String.raw`(im\d{5,})`, illustrationUrl],
  [String.raw`mylist/(\d{5,})`, mylistUrl],
  [String.raw`series/(\d{3,})`, seriesUrl],
  [String.raw`user/(\d{5,})`, userUrl]
];

// A reference starts after anything but a word character or a slash.
// The slash keeps ids in full URLs (https://nico.ms/sm9) as they are.
// A short link without a scheme (nico.ms/sm9) is linked as a whole.
const REFERENCES = REFERENCE_TYPES.map(([id, toUrl]) => [
  new RegExp(String.raw`(?<![\w/])(?:nico\.ms/)?${id}\b`, 'gi'),
  toUrl
]);

const linkReferences = (text) => REFERENCES.reduce(
  (result, [pattern, toUrl]) =>
    result.replace(pattern, (ref, id) => markdownLink(ref, toUrl(id.toLowerCase()))),
  text
);

// Discord ends a link at whitespace or at an unbalanced ')' or ']', but not
// at full-width punctuation, so https://example.com/） or URL、URL would take
// it into the link. A space goes before the first non-ASCII punctuation after
// a URL. Other non-ASCII text stays, since it can be part of a real path.
const separateUrlsFromPunctuation = (text) =>
  text.replace(/https?:\/\/\S+?(?=(?![\x00-\x7f])\p{P})/gu, '$& ');

export const descriptionToMarkdown = (html) => linkReferences(
  separateUrlsFromPunctuation(
    htmlToText(html, {
      wordwrap: false,
      preserveNewlines: true,
      selectors: [
        { selector: 'a', options: { hideLinkHrefIfSameAsText: true } }
      ]
    })
  )
);
