if (window.matchMedia("(pointer: coarse)").matches) alert("This website isn't meant to run on mobile so it will probably suck/not work, especially if you're using a device with a small screen.");

let streams = new URLSearchParams(location.search).get("streams");
let layoutObject = {
    lc: 1,
    v: [
        {
            id: "video1",
            src: "",
            name: "",
            order: 1
        },
        {
            id: "video2",
            src: "",
            name: "",
            order: 2
        },
        {
            id: "video3",
            src: "",
            name: "",
            order: 3
        },
        {
            id: "video4",
            src: "",
            name: "",
            order: 4
        },
        {
            id: "video5",
            src: "",
            name: "",
            order: 5
        },
        {
            id: "video6",
            src: "",
            name: "",
            order: 6
        },
        {
            id: "video7",
            src: "",
            name: "",
            order: 7
        },
        {
            id: "video8",
            src: "",
            name: "",
            order: 8
        },
        {
            id: "video9",
            src: "",
            name: "",
            order: 9
        }
    ]
};

let chatHTMLs = [];
if (streams && streams.split(",").length > 1) {
    streams = streams.split(",");
    layoutObject.lc = streams.length;
    for (const stream in streams) {
        layoutObject.v[stream].src = `https://youtube.com/watch?v=${streams[stream]}`;
        const streamInfo = await fetch(`https://www.youtube.com/oembed?url=https%3A%2F%2Fyoutube.com%2Fwatch%3Fv%3D${streams[stream]}&format=json`)
            .then(response => response.json());

        layoutObject.v[stream].name = streamInfo.title;
        const countryEmoji = streamInfo.title.match(/[\uD83C][\uDDE6-\uDDFF][\uD83C][\uDDE6-\uDDFF]/g);
        if (streamInfo.author_name === "ESC Fent Live") {
            streamInfo.title = streamInfo.title.replace(" | 🔴 LIVE", "");
            if (countryEmoji.length > 0) streamInfo.title = streamInfo.title.replace(countryEmoji[0], "");
            streamInfo.title = `<b>${streamInfo.title.split(" - ")[0]}</b> - ${streamInfo.title.split(" - ")[1]}`;
        };
        chatHTMLs.push(`<div class="chat">
            <span class="chat-name ${streamInfo.author_name === "ESC Fent Live" && countryEmoji.length > 0 ? `country-flag-background" style="background-image: url('flags/${String.fromCodePoint(...[...countryEmoji[0]].map(c => c.codePointAt() - 127397)).toLowerCase()}.svg');` : ""}"><span><span>${streamInfo.title}</span></span></span>
            <iframe src="https://www.youtube.com/live_chat?v=${streams[stream]}&embed_domain=${window.location.hostname}&dark_theme=1" frameborder="0" class="chat-iframe"></iframe>
        </div>`);
    };

    // https://stackoverflow.com/a/54895776
    const group = (items, n) => items.reduce((acc, x, i) => {
        const idx = Math.floor(i / n);
        acc[idx] = [...(acc[idx] || []), x];
        return acc;
    }, []);
    const updateOverflows = () => {
        document.querySelectorAll(".chat-name > span").forEach(el => {
            if (el.clientWidth < el.scrollWidth) el.classList.add("overflowing")
            else el.classList.remove("overflowing");
        });
    };
    const chatGroupHTMLs = group(chatHTMLs, 3).map((el, i) => `<div class="chat-group ${i === 0 ? "active" : ""}">${el.map(el => el).join("")}</div>`);
    document.querySelector("#chats").innerHTML = chatGroupHTMLs.join("");
    if (chatGroupHTMLs.length > 1) {
        const updateNavigationButtons = (active) => {
            updateOverflows();
            document.querySelector("#previous").classList.toggle("hidden", !active.previousElementSibling);
            document.querySelector("#next").classList.toggle("hidden", !active.nextElementSibling);
        };
        document.querySelector("#next").classList.remove("hidden");
        document.querySelector("#previous").addEventListener("click", () => {
            const element = document.querySelector(".chat-group.active");
            if (!element.previousElementSibling) return;

            element.classList.remove("active");
            element.previousElementSibling.classList.add("active");
            updateNavigationButtons(element.previousElementSibling);
        });
        document.querySelector("#next").addEventListener("click", () => {
            const element = document.querySelector(".chat-group.active");
            if (!element.nextElementSibling) return;

            element.classList.remove("active");
            element.nextElementSibling.classList.add("active");
            updateNavigationButtons(element.nextElementSibling);
        });
    };

    updateOverflows();

    let isDragging = false;
    const enableDragging = () => {
        isDragging = true;
        document.body.classList.add("dragging");
    };
    const disableDragging = () => {
        isDragging = false;
        document.body.classList.remove("dragging");
    };
    document.querySelector("#separator").addEventListener("mousedown", enableDragging);
    document.querySelector("#separator").addEventListener("touchstart", enableDragging);
    document.querySelector("#separator").addEventListener("mouseup", disableDragging);
    document.querySelector("#separator").addEventListener("touchend", disableDragging);

    const pointerMoveHandler = (e) => {
        if (document.querySelector("#vidgrid").clientWidth <= 768) document.querySelector("#vidgrid").style.height = "100%"
        else document.querySelector("#vidgrid").style.height = "";

        if (!isDragging) return;

        updateOverflows();
        const heightPx = (e.touches ? e.touches[0].clientX : e.clientX) * (9 / 16);
        if (heightPx <= 0) return;

        let heightVh = (heightPx / window.innerHeight) * 100;
        if (heightVh >= 100 && (!document.body.classList.contains("hide-chat"))) {
            heightVh = 100;
            isDragging = false;
            document.body.classList.add("hide-chat");
            document.body.classList.remove("dragging");
        } else {
            if (document.body.classList.contains("hide-chat") && heightVh < 100) document.body.classList.remove("hide-chat");
            if (heightVh > 100) heightVh = 100;
        };

        document.documentElement.style.setProperty("--height", `${heightVh}svh`);
    };
    document.addEventListener("mousemove", pointerMoveHandler);
    document.addEventListener("touchmove", pointerMoveHandler);

    document.querySelector("iframe").src = `https://vidgrid.tk.gg/?layout=${LZString.compressToEncodedURIComponent(JSON.stringify(layoutObject))}`;
    document.querySelector("#overlay").classList.add("hidden");
} else {
    document.querySelector("#overlay").innerHTML = "Error: No streams URL parameter, or less than 2 streams specified.";
};