function loadFooter() {
      fetch("../Components/Structure_component_css/Structures_components/Footer.html")
        .then(res => res.text())
        .then(html => {
            document.getElementById("footer").innerHTML = html;

            // Set dynamic copyright
            const date = new Date();
            const month = date.toLocaleString('default', { month: 'long' });
            const year = date.getFullYear();

            document.getElementById("footer-copy").innerText =
                `© ${month} ${year} GROUP8`;
        });
}
