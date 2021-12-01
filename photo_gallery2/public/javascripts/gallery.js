document.addEventListener("DOMContentLoaded", e => {
    const templates = {};
    let photos;

    document.querySelectorAll("script[type='text/x-handlebars']").forEach(tmpl => {
        templates[tmpl["id"]] = Handlebars.compile(tmpl["innerHTML"]);
    })

    document.querySelectorAll("[data-type=partial]").forEach(tmpl => {
        Handlebars.registerPartial(tmpl["id"], tmpl["innerHTML"]);
    })

    document.querySelector("section > header").addEventListener("click", (e) => {
        e.preventDefault();
        let button = e.target;
        let buttonType = button.getAttribute("data-property");
        if (buttonType) {
            let href = button.getAttribute("href");
            let dataId = button.getAttribute("data-id");
            let text = button.textContent;

            fetch(href, {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlenclosed; charset=UTF-8"
                },
                body: "photo_id=" + dataId
            })
            .then(res => res.json())
            .then(json => {
                button.textContent = text.replace(/\d+/,json.total);
            });
        }

    });

    document.querySelector("form").addEventListener("submit", (e) => {
        e.preventDefault();
        let form = e.target;
        let href = form.getAttribute("action");
        let method = form.getAttribute("method");
        let data = new FormData(form);
        let currentSlide = slideshow.currentSlide.getAttribute("data-id");
        data.set("photo_id", currentSlide);

        fetch(href, {
            method: method,
            headers: {
                "Content-Type": "application/s-www-form-urlenclosed; charset=UTF-8"
            },
            body: new URLSearchParams([...data])
        })
        .then(res => res.json())
        .then(json => {
            let commentsList = document.querySelector("#comments ul");
            commentsList.insertAdjacentHTML("beforeend", templates.photo_comment(json));
            form.reset()
        });
    });

    const slideshow = {
        prevSlide: (e)=> {
            e.preventDefault();
            let prev = this.currentSlide.previousElementSibling;
            if (!prev) {
                prev = this.lastSlide;
            }
            this.fadeOut(this.currentSlide);
            this.fadeIn(prev);
            this.renderPhotoContent(prev.getAttribute("data-id"));
            this.currentSlide = prev;
        },
        nextSlide: (e) => {
            e.preventDefault();
            let next = this.currentSlide.nextElementSibling;
            if (!next) {
                next = this.firstSlide;
            }
            this.fadeOut(this.currentSlide);
            this.fadeIn(next);
            this.renderPhotoContent(next.getAttribute("data-id"));
            this.currentSlide = next;
        },
        fadeOut: (slide) => {
            slide.classList.add('hide');
            slide.classList.remove("show");
        },
        fadeIn: (slide) => {
            slide.classList.remove("hide");
            slide.classList.add("show");
        },
        renderPhotoContent: (idx) => {
            renderPhotoInformation(Number(idx));
            getCommentsFor(idx);
        },
        bind: ()=> {
            let prevButton = this.slideshow.querySelector("a.prev");
            let nextButton = this.slideshow.querySelector("a.next");
            prevButton.addEventListener("click", (e) => {this.prevSlide(e)});
            nextButton.addEventListener("click", (e) => {this.nextSlide(e)});
        },
        init: () => {
            this.slideshow = document.querySelector("#slideshow");
            let slides = this.slideshow.querySelectorAll("figure");
            this.firstSlide = slides[0];
            this.lastSlide = slides[slides.length - 1];
            this.currentSlide = this.firstSlide;
            this.bind();
        }
    }

    fetch("/photos")
        .then(res => res.json())
        .then(json => {
            photos = json;
            renderPhotos();
            renderPhotoInformation(photos[0].id);
            getCommentsFor(photos[0].id);
        })

    function renderPhotos() {
        let slides = document.getElementById("slides");
        slides.insertAdjacentHTML("beforeend",templates.photos({photos: photos}));
    }

    function renderPhotoInformation(idx) {
        let photo = photos.filter((item) => {
            return item.id === idx;
        })[0];
        let header = document.querySelector("section > header");
        header.insertAdjacentHTML("beforeend", templates.photo_information(photo));
    }

    function getCommentsFor(idx) {
        fetch("/comments?photo_id" + idx)
            .then(res => res.json())
            .then(comment_json => {
                let comment_list = document.querySelector("#comments ul");
                comment_list.insertAdjacentHTML("beforeend", templates.photo_comments({comments: comment_json}))
            })
    }
});