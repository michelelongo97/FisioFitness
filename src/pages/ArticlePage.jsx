import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { PortableText } from "@portabletext/react";
import { client, urlFor } from "../lib/sanity";

const QUERY = `*[_type == "article" && slug.current == $slug && published == true][0] {
  title, publishedAt, coverImage, body
}`;

// Componenti custom per PortableText
const ptComponents = {
  types: {
    image: ({ value }) => (
      <img
        src={urlFor(value).width(900).url()}
        alt={value.alt || ""}
        className="article-inline-img"
        loading="lazy"
      />
    ),
  },
};

export default function ArticlePage() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch(QUERY, { slug }).then((data) => {
      setArticle(data);
      setLoading(false);
    });
  }, [slug]);

  if (loading)
    return (
      <div className="article-page">
        <p className="blog-loading">Caricamento...</p>
      </div>
    );
  if (!article)
    return (
      <div className="article-page">
        <p>
          Articolo non trovato. <Link to="/blog">Torna al blog</Link>
        </p>
      </div>
    );

  return (
    <div className="article-page">
      <div className="article-container">
        <Link to="/blog" className="article-back">
          ← Tutti gli articoli
        </Link>

        <p className="article-date">
          {new Date(article.publishedAt).toLocaleDateString("it-IT", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <h1>{article.title}</h1>

        {article.coverImage && (
          <img
            src={urlFor(article.coverImage).width(900).height(450).url()}
            alt={article.title}
            className="article-cover"
            loading="lazy"
          />
        )}

        <div className="article-body">
          <PortableText value={article.body} components={ptComponents} />
        </div>

        <div className="article-footer">
          <Link to="/blog" className="btn">
            ← Torna agli articoli
          </Link>
        </div>
      </div>
    </div>
  );
}
