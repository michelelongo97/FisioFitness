export default {
  name: 'article',
  title: 'Articolo',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Titolo',
      type: 'string',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug (URL)',
      type: 'slug',
      options: {source: 'title', maxLength: 96},
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'publishedAt',
      title: 'Data pubblicazione',
      type: 'datetime',
    },
    {
      name: 'excerpt',
      title: 'Anteprima',
      type: 'text',
      rows: 3,
      description: 'Breve descrizione mostrata nella lista articoli',
    },
    {
      name: 'coverImage',
      title: 'Immagine di copertina',
      type: 'image',
      options: {hotspot: true},
    },
    {
      name: 'body',
      title: 'Contenuto',
      type: 'array',
      of: [
        {type: 'block'}, // testo ricco (bold, italic, link...)
        {
          type: 'image', // immagini inline
          options: {hotspot: true},
        },
      ],
    },
    {
      name: 'published',
      title: 'Pubblicato',
      type: 'boolean',
      initialValue: false,
    },
  ],
  preview: {
    select: {title: 'title', media: 'coverImage', published: 'published'},
    prepare({title, media, published}) {
      return {title, media, subtitle: published ? '✅ Pubblicato' : '🟡 Bozza'}
    },
  },
}
