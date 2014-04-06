## Grammar ##

Allow any amount of whitespace between tokens (Word and Close):

    Text        ::=  Sentence(*)

    Sentence    ::=  Word(+)  Close

    Word        ::=  SpecialWord  |  [a-ZA-Z](+)

    SpecialWord ::=  'i.e.'

    Close       ::=  '.'  |  '!'  |  '?'

    Whitespace  ::=  /[ \t\n,:]/

## Notes ##

Issues that are handled:

 - `i.e.` doesn't end a sentence

Issues that aren't handled:

 - punctuation within a sentence is just thrown away
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