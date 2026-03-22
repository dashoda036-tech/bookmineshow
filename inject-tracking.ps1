$files = Get-ChildItem -Path "." -Filter "*orderpage.html"

$scriptToInject = @'
<script>
  document.addEventListener("DOMContentLoaded", function () {
    const form = document.querySelector("form");
    if (!form) return;
    const matchName = document.title.replace("Vite + React", "").trim() ||
      (document.querySelector(".font-medium.text-gray-800") ? document.querySelector(".font-medium.text-gray-800").textContent : "IPL Match");

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const fullName = document.getElementById("fullName").value.trim();
      const email = document.getElementById("email").value.trim();
      const phone = document.getElementById("phone").value.trim();
      const matchEl = document.querySelector('[class*="font-medium"][class*="text-gray-800"]');
      const match = matchEl ? matchEl.textContent : window.location.pathname;

      try {
        await fetch("http://localhost:3001/api/customers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fullName, email, phone, match })
        });
      } catch (err) { console.warn("Could not save customer data", err); }

      form.submit();
    });
  });
</script>
'@

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -notmatch "localhost:3001/api/customers") {
        $content = $content -replace "</body>", "$scriptToInject`n</body>"
        Set-Content $file.FullName $content -NoNewline
        Write-Host "Updated: $($file.Name)"
    } else {
        Write-Host "Already updated: $($file.Name)"
    }
}
Write-Host "Done!"
