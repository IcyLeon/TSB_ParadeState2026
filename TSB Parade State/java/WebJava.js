var table = document.getElementById("ParadeStateTable");
table.hidden = true;

function AddTeamElement(Team)
{
    const newRow = document.createElement("tr");
    newRow.classList.add("Team");
    const cell1 = document.createElement("th");
    cell1.setAttribute("colspan", "4"); 
    cell1.textContent = Team;
    newRow.appendChild(cell1);
    table.appendChild(newRow);
}

function AddElement(OfficeID, TimeStamp, Name, Attendance)
{
    const newRow = document.createElement("tr");
    const cell0 = document.createElement("td");

    if (OfficeID != 0) {

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = false;
        checkbox.addEventListener("change", Save);
        cell0.appendChild(checkbox);
    }

    const cell1 = document.createElement("td");
    const cell2 = document.createElement("td");
    const cell3 = document.createElement("td");

    cell1.textContent = TimeStamp;
    cell2.textContent = Name;
    cell3.textContent = Attendance;

    newRow.appendChild(cell0);
    newRow.appendChild(cell1);
    newRow.appendChild(cell2);
    newRow.appendChild(cell3);

    table.appendChild(newRow);
}

function RemoveAllElements() {
  const rows = document.querySelectorAll("#ParadeStateTable tr:nth-child(n+2)");
  rows.forEach(row => row.remove());
}

function LoadData() 
{
    const rows = document.querySelectorAll("#ParadeStateTable tr:nth-child(n+2)");
    const savedData = localStorage.getItem("paradeStateData");
    if (!savedData) return;

    const tableData = JSON.parse(savedData);
    tableData.forEach((data) => {
        const targetRow = FindRowByName(data.name);
        var checkBox = targetRow?.querySelector("input");
        if (checkBox)
        {
            checkBox.checked = data.checked;
        }
    });
}

function FindRowByName(targetName) {
    const rows = Array.from(document.querySelectorAll("#ParadeStateTable tr:nth-child(n+2)"));

    // Find the row where the 3rd cell matches the name
    const matchedRow = rows.find(row => {
        const cells = row.querySelectorAll("td");
        return cells[2] && cells[2].textContent.trim() === targetName.trim();
    });

    return matchedRow;
}


function Save()
{
    const rows = document.querySelectorAll("#ParadeStateTable tr:nth-child(n+2)");
    const tableData = [];

    rows.forEach(row => {
        const cells = row.querySelectorAll("td");
        var checkbox = cells[0]?.querySelector("input");

        if (!checkbox)
            return;

        const rowData = {
            checked: checkbox.checked,
            name: cells[2].textContent,
        };
        tableData.push(rowData);
    });

    localStorage.setItem("paradeStateData", JSON.stringify(tableData));
}

function ClearSavedData() {
    localStorage.removeItem("paradeStateData");
    const checkboxes = document.querySelectorAll("#ParadeStateTable input[type='checkbox']");
    checkboxes.forEach(cb => cb.checked = false);
}

async function ShowData() {
  try {
    // FIXED: Run sequentially because Staff relies on Offices, and Attendance relies on Staff.
    console.log("Loading Offices...");
    await read_Office();
    
    console.log("Loading Staff...");
    await read_Staffs();
    
    console.log("Loading Attendance...");
    try {
      await read_Attendance();
    } catch (attendanceError) {
      console.warn("Attendance failed to load, carrying on without it:", attendanceError);
    }
    
    console.log("All data loaded successfully!");
    RemoveAllElements();
    officeManager.Print();
    table.hidden = false;
    LoadData();
    
  } catch (error) {
    table.hidden = true;
    console.error("Execution failed: ", error);
    document.getElementById("report").innerText = "Failed to load data.";
  }
}
