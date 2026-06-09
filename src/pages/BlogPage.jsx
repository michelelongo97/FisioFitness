import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { client, urlFor } from "../lib/sanity";

const QUERY = `*[_type == "article" && published == true] | order(publishedAt desc) {
  _id, title, slug, excerpt, publishedAt, coverImage
}`;

export default function BlogPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.fetch(QUERY).then((data) => {
      setArticles(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="blog-page">
      <div className="blog-container">
        <h1>Articoli</h1>
        <p className="blog-subtitle">
          Approfondimenti su fisioterapia, allenamento e benessere
        </p>

        {loading ? (
          <p className="blog-loading">Caricamento...</p>
        ) : articles.length === 0 ? (
          <p className="blog-empty">Nessun articolo pubblicato ancora.</p>
        ) : (
          <div className="blog-grid">
            {articles.map((article) => (
              <Link
                key={article._id}
                to={`/blog/${article.slug.current}`}
                className="blog-card"
              >
                {article.coverImage && (
                  <div className="blog-card-img-wrapper">
                    <img
                      src={urlFor(article.coverImage)
                        .width(600)
                        .height(340)
                        .url()}
                      alt={article.title}
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="blog-card-body">
                  <p className="blog-card-date">
                    {new Date(article.publishedAt).toLocaleDateString("it-IT", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2>{article.title}</h2>
                  {article.excerpt && (
                    <p className="blog-card-excerpt">{article.excerpt}</p>
                  )}
                  <span className="blog-read-more">Leggi →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
