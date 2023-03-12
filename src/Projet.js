import React from 'react';
import axios from 'axios';
import './Projet.css';

class Projet extends React.Component {
  constructor(props) {
    super(props);
    // We initialize all the values
    this.state = { value: '', pictures: [], titles: [], descriptions: [], error: '', previewLink: [], startIndex: 0, maxResults: 10, totalBooks: null };
    this.handleChange = this.handleChange.bind(this);
    this.handleNext = this.handleNext.bind(this);
    this.handlePrev = this.handlePrev.bind(this);
    this.getTotalBooks = this.getTotalBooks.bind(this);
  }

  getTotalBooks(value) {
    let total = 0;
    const requete =
      "https://www.googleapis.com/books/v1/volumes?q=inauthor:" + value;
    axios
      .get(requete)
      .then((response) => {
        // We get the total number of books of the author
        total = response.data.totalItems;
        this.setState({ totalBooks: total });
      })
      .catch((error) => {
        console.log("Erreur serveur" + error);
      })
  }

  handleChange(event) {
    const target = event.target;
    const value = target.tagName === 'INPUT' ? target.value : null;
    this.setState({ value, pictures: [], titles: [], descriptions: [], error: '', previewLink: [] });
    this.getTotalBooks(value);

    // Books are collected in increments of 10
    let requete =
      "https://www.googleapis.com/books/v1/volumes?q=inauthor:" + value + "&startIndex=" + this.state.startIndex + "&maxResults=" + this.state.maxResults;
    axios
      .get(requete)
      .then((response) => {
        if (response.data.items != null) {
          const pictures = [];
          const titles = [];
          const descriptions = [];
          const previewLink = [];
          for (const item of response.data.items) {
            const thumbnail = item.volumeInfo.imageLinks?.thumbnail;
            if (thumbnail) {
              // We get the pictures
              pictures.push(thumbnail);
            }
            else {
              // If there is no image, one is displayed by default
              pictures.push('https://via.placeholder.com/150x200.png?text=Missing+Cover');
            }
            // We get the titles
            titles.push(item.volumeInfo.title);
            // We get the descriptions
            descriptions.push(item.volumeInfo.description);
            // We get the preview links
            previewLink.push(item.volumeInfo.previewLink);
          }

          // We update the variables
          this.setState({ pictures, titles, descriptions, previewLink });
        }
        else {
          this.setState({ error: 'Aucun ouvrage correspondant à votre recherche : ' + this.state.value });
        }
      })
      .catch((error) => {
        console.log("Erreur serveur" + error);
      })
  }

  handlePrev() {
    // We get the value of startIndex and maxResults
    const { startIndex, maxResults } = this.state;
    if (startIndex >= maxResults) {
      // Back to previous books
      this.setState({ startIndex: startIndex - maxResults }, () => {
        this.handleChange({ target: { tagName: 'INPUT', value: this.state.value } });
      });
    }
  }

  handleNext() {
    // We get the value of startIndex, maxResults and totalBooks
    const { startIndex, maxResults, totalBooks } = this.state;
    if (startIndex + maxResults <= totalBooks) {
      // Moving on to the next books
      this.setState({ startIndex: startIndex + maxResults }, () => {
        this.handleChange({ target: { tagName: 'INPUT', value: this.state.value } });
      });
    }
  }

  render() {
    // We get all the values ​​we need
    const { pictures, titles, descriptions, error, previewLink, startIndex, maxResults, totalBooks } = this.state;

    return (
      <div>
        { /* Title and search display with author */ }
        <div id="head">
          <div id="legend">
            <legend>API de recherche Google</legend>
          </div>
          <div id="research">
            <input name="value" type="text" onChange={ this.handleChange } placeholder="Auteur"/>
          </div>
        </div>
        { /* If the author sought does not correspond to any book, a sentence is displayed accordingly */ }
        { error != '' ? (
          <div id="error">
            <p>{ error }</p>
          </div>
        ) : 
            /* Otherwise, we display the corresponding books and the pagination */
            <div>
              <div id="container">
              { /* We check that there are titles and we associate each book with an index i */ }
              { titles.length > 0 ? titles.map((title, i) => (
                  <div key={ i } id="book">
                    { /* We display the cover of each book */ }
                    <img src={ pictures[i] } alt={ title } id="bookImage" />
                    <div>
                      { /* We display the title of the book and we put the preview link on it */ }
                      <a href={ previewLink[i] }>{ title.length > 5 ? title.slice(0, 5) + '...' : title }</a>
                      { /* We display the description */ }
                      <p id="bookDescription">{ descriptions[i] }</p>
                    </div>
                  </div>
                )) : null }
              </div>

              <div id="paging">
                <div>
                  { /* Link to return to the previous page */ }
                  <a href="#" onClick={ this.handlePrev } className="link">Prev</a>
                </div>
                <div>
                  { /* If books are displayed, we also display the number of the books we see and the total number of books */}
                  { totalBooks != null ? (
                    <p id="numbers">[{ startIndex + 1 } ... { startIndex + maxResults <= totalBooks ? startIndex + maxResults : totalBooks }] / { totalBooks }</p>
                  ) : null }
                </div>
                <div>
                  { /* Link to go to the next page */ }
                  <a href="#" onClick={ this.handleNext } className="link">Next</a>
                </div>
              </div>
            </div> }

      </div>
    );
  }
  
}

export default Projet;
