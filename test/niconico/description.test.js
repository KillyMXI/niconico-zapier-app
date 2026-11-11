import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { descriptionToMarkdown } from '../../niconico/description.js';

describe('descriptionToMarkdown', () => {
  it('strips HTML tags', () => {
    assert.equal(
      descriptionToMarkdown('<strong>bold</strong> <span style="color: #000000;">plain</span> <font color="#f00">red</font>'),
      'bold plain red'
    );
  });

  it('turns both forms of <br> into line breaks and keeps blank lines', () => {
    assert.equal(descriptionToMarkdown('one<br>two<br /><br>four'), 'one\ntwo\n\nfour');
  });

  it('decodes entities and leaves quotes as they are', () => {
    assert.equal(descriptionToMarkdown('say "hi" &amp; &lt;bye&gt;'), 'say "hi" & <bye>');
  });

  it('shows a link as its URL when the text is the URL', () => {
    assert.equal(descriptionToMarkdown('<a href="https://example.com">https://example.com</a>'), 'https://example.com');
  });

  describe('full URLs', () => {
    for (const [input, expected] of [
      ['（https://example.com/）', '（https://example.com/ ）'],
      ['【https://youtu.be/abc】', '【https://youtu.be/abc 】'],
      ['https://example.com/a、https://example.com/b', 'https://example.com/a 、https://example.com/b'],
      ['https://example.com/?id=1【説明】', 'https://example.com/?id=1 【説明】']
    ]) {
      it(`separate from full-width punctuation in ${input}`, () => {
        assert.equal(descriptionToMarkdown(input), expected);
      });
    }

    it('keep a Japanese path whole', () => {
      const text = 'http://www.youtube.com/c/なめこのぼっち旅';
      assert.equal(descriptionToMarkdown(text), text);
    });

    it('stay as they are before ASCII punctuation and whitespace', () => {
      const text = '(https://example.com/a) [https://example.com/b] https://example.com/c\nnext';
      assert.equal(descriptionToMarkdown(text), text);
    });

    it('keep their ids unlinked after a space is inserted', () => {
      assert.equal(descriptionToMarkdown('https://nico.ms/sm12345、次'), 'https://nico.ms/sm12345 、次');
    });
  });

  describe('references', () => {
    for (const [input, expected] of [
      ['sm12345', '[sm12345](https://nico.ms/sm12345)'],
      ['nm12345', '[nm12345](https://nico.ms/nm12345)'],
      ['so12345', '[so12345](https://www.nicovideo.jp/watch/so12345)'],
      ['im12345', '[im12345](https://seiga.nicovideo.jp/seiga/im12345)'],
      ['mylist/12345', '[mylist/12345](https://www.nicovideo.jp/mylist/12345)'],
      ['series/12345', '[series/12345](https://www.nicovideo.jp/series/12345)'],
      ['user/12345', '[user/12345](https://www.nicovideo.jp/user/12345)'],
      ['nico.ms/sm12345', '[nico.ms/sm12345](https://nico.ms/sm12345)'],
      ['nico.ms/im12345', '[nico.ms/im12345](https://seiga.nicovideo.jp/seiga/im12345)']
    ]) {
      it(`links ${input}`, () => {
        assert.equal(descriptionToMarkdown(input), expected);
      });
    }

    it('links every reference, also next to Japanese punctuation', () => {
      assert.equal(
        descriptionToMarkdown('前→【sm12345】<br>他の動画⇒mylist/67890'),
        '前→【[sm12345](https://nico.ms/sm12345)】\n他の動画⇒[mylist/67890](https://www.nicovideo.jp/mylist/67890)'
      );
    });

    it('links references in any case, to lowercase URLs', () => {
      assert.equal(
        descriptionToMarkdown('Series/12345 SM12345 Nico.ms/Nm12345'),
        '[Series/12345](https://www.nicovideo.jp/series/12345) [SM12345](https://nico.ms/sm12345) [Nico.ms/Nm12345](https://nico.ms/nm12345)'
      );
    });

    it('leaves IDs that are part of a longer word', () => {
      assert.equal(descriptionToMarkdown('xsm12345 sm12345x'), 'xsm12345 sm12345x');
    });

    it('leaves IDs that are too short to be real', () => {
      const text = 'SM58 nm1234 so1234 im1234 mylist/1234 series/12 user/1234 nico.ms/sm1234';
      assert.equal(descriptionToMarkdown(text), text);
    });

    it('links series IDs from 3 digits, which are common', () => {
      assert.equal(descriptionToMarkdown('【series/2121】'), '【[series/2121](https://www.nicovideo.jp/series/2121)】');
    });

    for (const url of [
      'https://nico.ms/sm12345',
      'https://www.nicovideo.jp/watch/sm12345',
      'https://www.nicovideo.jp/watch/so12345',
      'https://www.nicovideo.jp/mylist/12345',
      'https://www.nicovideo.jp/user/12345/series/12345',
      'https://seiga.nicovideo.jp/seiga/im12345',
      'http://www.nicovideo.jp/user/12345'
    ]) {
      it(`leaves the ID in ${url} as it is`, () => {
        assert.equal(descriptionToMarkdown(`見て⇒${url} です`), `見て⇒${url} です`);
      });
    }
  });

  for (const description of ['', null, undefined]) {
    it(`is empty for ${JSON.stringify(description) ?? 'undefined'}`, () => {
      assert.equal(descriptionToMarkdown(description), '');
    });
  }
});
