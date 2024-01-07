document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM Content loaded.");

    if (document.querySelector(".index")) {
        let base_urls = "";
        let image_size = "";
        config();


        console.log("1st file");

        let search_button = document.querySelector("#indexbutton");
        console.log(search_button, typeof (search_button));
        search_button.addEventListener("click", searched);

        let url = "";
        const api_key = "9297e0ed0a3c81d2d4d578d9d4ff80dd";

        function searched() {
            let dropdown = document.querySelector("#Language_dropdown");
            let language = dropdown.options[dropdown.selectedIndex].value;
            console.log("prev lang=", language);
            sessionStorage.setItem("language", language);
            console.log("Search entered");
            const search = document.querySelector("#Movie_search_box");
            const search_value = search.value;
            movie_name = search_value;

            url = `https://api.themoviedb.org/3/search/movie?query=${movie_name}&include_adult=false&language=en-US&page=1&api_key=${api_key}`;
            fetch(url)
                .then(response => response.json())
                .then(parsedata)
                .catch(err => console.error(err));
        }



        function config() {
            let configuration_url = "https://api.themoviedb.org/3/configuration?api_key=9297e0ed0a3c81d2d4d578d9d4ff80dd";
            fetch(configuration_url)
                .then(response => response.json())
                .then(response => {
                    base_urls = response.images.base_url;
                    console.log("base url =", base_urls);
                    image_size = response.images.poster_sizes[response.images.poster_sizes.length - 2];// handle image size
                    console.log("image size =", image_size);
                })
                .catch(err => console.error(err));
        }



        let movie_title;
        let image_url;
        let tmdb_id;
        const img = document.querySelector(".card img");
        const card_container = document.querySelector(".Results");

        function parsedata(response) {
            console.log(response);
            card_container.innerHTML = "";
            response.results.forEach(element => {
                movie_title = element.original_title;
                if(element.backdrop_path==null && element.poster_path==null){
                    image_url="https://www.salonlfc.com/wp-content/uploads/2018/01/image-not-found-scaled-1150x647.png";
                }
                else if(element.backdrop_path==null){
                    image_url = base_urls + image_size + "/" + element.poster_path;
                }
                else{
                image_url = base_urls + image_size + "/" + element.backdrop_path;
                }
                tmdb_id = element.id;
                console.log("Poster path", image_url);
                const card = document.createElement("div");

                card.classList = ["card"];
                const card_content = `
                    <img src="${image_url}">
                    <h2>${movie_title}</h2>
                    <template>${tmdb_id}</template>`
                card.innerHTML = card_content;
                card_container.appendChild(card);
                card.addEventListener("click", () => subpage(card));


            });
        }

        function subpage(card) {
            const children = card.children;
            console.log("children=", children);
            const img_src = children[0].src;
            const mov_title = children[1].innerHTML;
            const tmdb_id = children[2].innerHTML;
            sessionStorage.setItem("img_src", img_src);
            sessionStorage.setItem("mov_title", mov_title);
            sessionStorage.setItem("tmdb id", tmdb_id);
            window.open("subtitle.html", "_self");

        }
        //button.addEventListener("click", searched);

    }

    else {
        console.log("2nd file");
        const img_src = sessionStorage.getItem("img_src");
        const mov_title = sessionStorage.getItem("mov_title");
        const tmdb_id = sessionStorage.getItem("tmdb id");
        const language = sessionStorage.getItem("language");
        console.log(tmdb_id);
        console.log(language);
        const sec_img = document.querySelector(".subtitle .image_name img");
        const sec_title = document.querySelector(".subtitle .image_name h2");

        sec_img.src = img_src;
        sec_title.innerHTML = mov_title;
        document.title = mov_title;


        const api_key_sub = "LW2NSfQScJmcX0RBUxp2Nc6KxYDCorX0";
        const url_sub = `https://api.opensubtitles.com/api/v1/subtitles?tmdb_id=${tmdb_id}&languages=${language}`;

        const options = {
            method: 'GET',
            headers: {
                "Api-Key": api_key_sub,
                "X-User-Agent": "Subtle/1.0",
                "Accept": "application/json"
            }
        };

        fetch(url_sub, options)
            .then(response => response.json())
            .then(extractSub)
            .catch(err => console.error(err));

        const goback_button = document.querySelector(".subtitle .goback");
        goback_button.addEventListener("click", () => {
            window.history.back();
        });

    }

    function extractSub(response) {
        const api_key_sub = "LW2NSfQScJmcX0RBUxp2Nc6KxYDCorX0";
        console.log(response);
        no_of_sub = 0;
        if (response.data.length > 4) {
            no_of_sub = 4;
        }
        else {
            no_of_sub = response.data.length;
        }
        console.log(no_of_sub);
        if (no_of_sub == 0) {
            console.log("NO SUBTITLES EXIST FOR THIS MOVIE.");
            h2=document.querySelector(".status");
            h2.innerHTML="No subtitles found."
        }
        else {
            const sub_section = document.querySelector(".subtitle_section");
            sub_section.innerHTML="";
            for (let i = 0; i < no_of_sub; i++) {
                let file_id = response.data[i].attributes.files[0].file_id;
                console.log(file_id);
                const url_sub_download = "https://api.opensubtitles.com/api/v1/download";

                const options = {
                    method: 'POST',
                    headers: {
                        'X-User-Agent': 'Subtle/1.0',
                        'Content-Type': 'application/json',
                        "Accept": 'application/json',
                        'Api-Key': api_key_sub
                    },
                    body: `{"file_id":${file_id}}`
                };

                fetch(url_sub_download, options)
                    .then(response => response.json())
                    .then(response => {
                        console.log(response);
                        console.log(i, response.link);

                        fetch(response.link)
                            .then(response => response.blob())
                            .then(blob => {

                                const url = window.URL.createObjectURL(blob);
                                
                                sub_section.innerHTML += `
                                    <div class="sub${i+1}"> 
                                    <h3>Subtitle ${i+1}</h3>
                                    <a href="${url}" download="Subtitle ${i+1}.srt"><i class="fa-solid fa-download"></i></a>
                                    </div>`;
                            })
                            .catch(err => console.error(err));


                    })
                    .catch(err => console.error(err));

            }
        }
    }

});