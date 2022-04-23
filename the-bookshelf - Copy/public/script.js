const app = Vue.createApp({ 
    data(){
        return {  
            myNameIs: null,
            searchFilter: null,
            searchAuthor: null,
            showForm: false,    /*Show form when add book button is clicked*/
            showBooks: false,   /*Show book search results*/
            showBookForm: false,    /*form to search books*/
            results: [], 
            book2: null,
            a: false,   
            notice: null,  
            bookshelf: {
                reader: null,
                items: []
            }          
        }
    },
    methods:{     
        /**  process the hello form to get the user's name   */
        hello(){  
            axios.get('/bookshelf', {params: {reader: this.myNameIs}} )
                .then(response =>  this.bookshelf = response.data )
                .catch(error =>  this.showNotice("Error." ))
        },
        /**  process the search form by sending the query to NodeJS */
        search(){ 
            this.notice = null; // reset notices/messages 
            axios.get('/search/'+this.searchFilter+"/"+this.searchFilter )
                .then(response => {
                    this.results = response.data.items
                    this.showBooks = true
                    console.log(this.results);
                 })
                .catch(error =>  this.showNotice("No Results.") );
        },
        /** Skip a result (e.g. in case of 403 errors on images ) */
        skip(book){
            this.results =  this.results.filter(x => x.id !== book.id);  
        },
        
      
        /** Check if a given search result is owned
         * (i.e. it already exists in the 's plot). */
        isOwned(book){
            if ( this.bookshelf.items.filter(x => x.id == book.id).length > 0 ) return true;
            return false;
        },
        /** add book to next stage where user can edit the results*/
        add(book){
            if ( this.isOwned(book)) return
            this.book2 = book;
            console.log(this.book2)
            this.a = true;
        },

        /** push selected book and the user changes to the bookshelf*/
        shelf(book2){
            if ( this.isOwned(book2)) return
            this.bookshelf.items.push(book2);
            console.log(this.bookshelf);
            this.showForm = false;
            this.a = false;
            this.clearSearch();
            this.save();
        },

        /** remove a book from the bookshelf  */
        remove(book){
            this.bookshelf.items = this.bookshelf.items.filter(x => x.id !== book.id); 
            this.save()
        },
        save(){
            axios.post(  '/bookshelf',  this.bookshelf )
                .then(() => this.showNotice("Data Saved.") )
                .catch(() =>  this.showNotice("Unable to Save Data.") );
        },
        showNotice(text){
            this.notice = text;
            setTimeout(() => this.notice = false, 2000);
        },
        /** Reset the Search */
        clearSearch(){
            this.searchFilter = null;
            this.searchAuthor = null;
            this.results = null;
            this.notice = null;
        },

        searchBox() {
            this.showForm = true;
        },

        goBack() {
            this.showForm = false
        }

    }

}).mount('#app')