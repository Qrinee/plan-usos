# 🎓 Plan Zajęć USOS • Politechnika Rzeszowska

Nowoczesna, interaktywna aplikacja internetowa do przeglądania i synchronizacji planu zajęć, zintegrowana z oficjalnym **USOS API**

<img width="1917" height="945" alt="sa" src="https://github.com/user-attachments/assets/09c0e269-adc0-4ed7-a756-a062618500cc" />
<img width="301" height="722" alt="image" src="https://github.com/user-attachments/assets/fd1989df-9371-4705-bedd-46c021a88ea0" />


---

## 🌟 Funkcje Aplikacji

1. **Widoki Planu Zajęć:**
   - **Siatka Tygodniowa (Week Grid):** Przejrzysty układ godzinowy od 08:00 do 20:00 z podziałem na dni tygodnia (Pon–Pt z opcją włączenia Sobota/Niedziela dla studiów niestacjonarnych).
   - **Wskaźnik Czasu na Żywo ("Teraz"):** Czerwona linia ze znacznikiem aktualnej godziny na bieżącym dniu.
   - **Agenda Dzienna (Day View):** Idealny widok dla urządzeń mobilnych z kafelkami dni i chronologiczną osią czasu.
   - **Wykaz Tabelaryczny (List View):** Zestawienie z możliwością bezpośredniego wydruku (`Drukuj plan`).

2. **Baner „Najbliższe Zajęcia”:**
   - Wyświetla aktualnie trwające lub najbliższe nadchodzące zajęcia z odliczaniem czasu (np. *za 28 minut w sali V-104*).

3. **Integracja z USOS API (Politechnika Rzeszowska):**
   - **Pełny protokół OAuth 1.0a:** Bezpieczna autoryzacja z serwerem `https://usosapps.prz.edu.pl/`.
   - **Wyszukiwarka Przedmiotów Na Żywo:** Przeszukiwanie bazy przedmiotów PRZ w czasie rzeczywistym przez endpoint `services/courses/search`.
   - **Tryb Demonstracyjny (Out-of-the-box):** Realistyczny plan zajęć studenta Informatyki WEiI PRZ (z salami w Budynku V, B, A, L oraz prowadzącymi), działający natychmiast bez konieczności rejestracji kluczy.

4. **Karta Szczegółów Zajęć:**
   - Pełna nazwa (PL/EN), typ zajęć (Wykład, Laboratorium, Ćwiczenia, Projekt, Seminarium, Lektorat).
   - Budynek i sala na kampusie Politechniki Rzeszowskiej.
   - Prowadzący zajęcia.
   - **Prywatne notatki studenta:** Zapisywane lokalnie w przeglądarce (np. terminy kolokwiów, oddania projektów).
   - Bezpośredni link do przedmiotu w USOSweb PRZ.

5. **Eksport do Kalendarza:**
   - Pobieranie pełnego planu lub pojedynczych zajęć do pliku `.ics` (iCalendar), zgodnego z **Google Calendar**, **Apple Calendar** oraz **Microsoft Outlook**.

6. **Design i Aestetyka:**
   - Oficjalna paleta barw PRZ (granat `#003B71`, cyjan, biel i szarości).
   - Pełne wsparcie dla **Trybu Ciemnego (Dark Mode)**.
   - Płynne animacje i szklany efekt (glassmorphism).

---

## 🚀 Uruchomienie Lokalne

Aplikacja jest uruchomiona pod adresem:
👉 **`http://localhost:3000/`**

Aby uruchomić aplikację w dowolnym momencie:
```bash
cd usos
npm run dev
```

Budowanie wersji produkcyjnej:
```bash
npm run build
npm run start
```

---

