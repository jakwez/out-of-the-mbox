# out-of-the-mbox

- yet another [MBOX file](https://en.wikipedia.org/wiki/Mbox) viewer. **This is work in progress...**
- the main goal is to play with [React](https://react.dev/) and [MUI](https://mui.com/), mostly as a personal learning exercise not meant to be used seriously by people at this point
- eventually, I'd like to use it on large, multi GB, exported MBOX files, coming for example from Google Mail takeout
  - being able to quickly load the file client-side (no server storing data) and navigate the emails page by page
  - being able to view the content of the email as raw text or html, download the attachments, etc...
  - more advanced features like strict and fuzzy search in email subject, to/from, content, attachments, etc... would be awesome, but will require some indexing data structure that will be expensive to construct. So will keep that optional, and allow the result to be persisted (maybe exported as a file next to the MBOX one, or locally stored)

# To do

- email dialog
  - show nice headers: to, from, date...
  - show attachments list
  - show email index
  - navigate to next/prev
  - navigate to index
- main list
  - show index + headers in tooltip in list view
  - navigate to page index, or email index
- save settings globally in local storage
- postalmime.parse processing indicator (esp. for 200+)
- look at dompurify options more closely
- data/model
  - sort by date
  - support email threads
