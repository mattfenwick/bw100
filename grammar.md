## Grammar ##

    Text        ::=  Sentence(*)

    Sentence    ::=  Chunk  ( Punc  Chunk )(*)  Close

    Chunk       ::=  Word(+)

    Word        ::=  [a-ZA-Z]  |  SpecialWord

    SpecialWord ::=  'i.e.'

    Punc        ::=  ','  |  ':'

    Close       ::=  '.'  |  '!'  |  '?'

## Notes ##

Issues that are handled:

 - `i.e.` doesn't end a sentence

Issues that aren't handled:

 - ambiguity
 - distinguishing between an `i.e.` that ends a sentence
   and one that doesn't
 - other words which contain punctuation:  `Mr.`, `Ave.`, `etc.`
 - other non-letters in words:
   - hyphens
   - numbers
 - an actual subject/verb/predicate grammar
 - symbols
   - `$`
   - `&`