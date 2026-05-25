var table = document.getElementById("ParadeStateTable");
HideTable(true);

function HideTable(toggle)
{
    table.hidden = toggle;
}

function AddTeamElement(TeamName, NoOfPresent = 0, TotalStaffsInTeam)
{
    const newRow = document.createElement("tr");
    newRow.classList.add("Team");
    const cell1 = document.createElement("th");
    cell1.setAttribute("colspan", "4"); 
    cell1.textContent = `${TeamName} (${NoOfPresent}/${TotalStaffsInTeam})`;
    newRow.appendChild(cell1);
    table.appendChild(newRow);
}

function AddElement(OfficeID, TimeStamp, Name, Attendance, spreadsheetId)
{
    const newRow = document.createElement("tr");
    const cell0 = document.createElement("td");

    if (OfficeID != 0 && spreadsheetId == SPREADSHEET_ID_TSB) {

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

function ThrowErrorReport()
{
    RemoveAllElements();
    HideTable(true);
    document.getElementById("report").innerText = "Failed to load data.";
}


async function ShowTLSBData() {
    const token = gapi.client.getToken();
    document.getElementById("report").innerText = "";

    try {
  
        if (!token || !token.access_token) {
            ThrowErrorReport();
            return; // Block the function from executing
        }
        

    console.log("Loading Offices...");
    await read_Office(SPREADSHEET_ID_TLSB, 'HonourRoll!F2:G');
    
    console.log("Loading Staff...");
    await read_Staffs(SPREADSHEET_ID_TLSB, 'HonourRoll!A2:D');
    
    console.log("Loading Attendance...");
    try {
      await read_Attendance(SPREADSHEET_ID_TLSB, 'AttendanceRoll!A2:C');
    } catch (attendanceError) {
      console.warn("Attendance failed to load, carrying on without it:", attendanceError);
    }
    
    console.log("All data loaded successfully!");

    officeManager.Print();
    HideTable(false);
    LoadData();
    
  } catch (error) {
    HideTable(true);
    console.error("Execution failed: ", error);
    ThrowErrorReport();
  }
}

async function ShowTSBData() {
    const token = gapi.client.getToken();
    document.getElementById("report").innerText = "";

    try {
  
        if (!token || !token.access_token) {
            ThrowErrorReport();
            return; // Block the function from executing
        }
        

    console.log("Loading Offices...");
    await read_Office(SPREADSHEET_ID_TSB, 'HonourRoll!F2:G');
    
    console.log("Loading Staff...");
    await read_Staffs(SPREADSHEET_ID_TSB, 'HonourRoll!A2:D');
    
    console.log("Loading Attendance...");
    try {
      await read_Attendance(SPREADSHEET_ID_TSB, 'AttendanceRoll!A2:C');
    } catch (attendanceError) {
      console.warn("Attendance failed to load, carrying on without it:", attendanceError);
    }
    
    console.log("All data loaded successfully!");

    officeManager.Print();
    HideTable(false);
    LoadData();
    
  } catch (error) {
    HideTable(true);
    console.error("Execution failed: ", error);
    ThrowErrorReport();
  }
}
