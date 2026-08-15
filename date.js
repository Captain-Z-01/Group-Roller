document.getElementById("year").textContent = new Date().getFullYear();
   
    function updateDateTime() {
      const now = new Date();

      const date = now.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });

      const time = now.toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
      });

      document.getElementById("datetime").textContent =
        `${date} • ${time}`;
    }

    updateDateTime();
    setInterval(updateDateTime, 1000);