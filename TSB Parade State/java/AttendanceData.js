const SPREADSHEET_ID_TSB = '1qyLj7bFNxjGGAycRBj7TnS47Z4nL7DT-F1Atbnw-v0w';
const SPREADSHEET_ID_TLSB = '1vylevO7L00uoj69y0ScnPj6W2CorNUCZRtflnUsOMZo';

class Staff
{
  constructor(StaffName)
  {
    this.StaffName = StaffName;
    this.AttendanceDetails = ["", "no resp"];
  }

  UpdateAttendance(TimeStamp, Attendance)
  {
    this.AttendanceDetails = [TimeStamp, Attendance];
  }
}

class Office
{
  #Teams;
  #SpreadSheetID;

  constructor(OfficeName, OfficeID, SpreadSheetID)
  {
    this.OfficeName = OfficeName;
    this.OfficeID = OfficeID;
    this.SpreadSheetID = SpreadSheetID;

    this.Staffs = new Map();
    this.Teams = new Map();
    this.TeamPresentCount = new Map();
  }

  GetStaff(StaffName) {
    for (let staff of this.Staffs.keys()) {
      if (staff.StaffName === StaffName) 
        return staff;
    }
    return undefined;
  }

  AddStaff(StaffName, Team)
  {
    if (this.GetStaff(StaffName) != undefined)
      return;

    var staff = new Staff(StaffName);
    this.Staffs.set(staff, true);

    if (!this.Teams.has(Team)) {
      this.Teams.set(Team, []);
    }

    this.Teams.get(Team).push(staff);
  }
  
  UpdateAttendance(TimeStamp, StaffName, Attendance)
  {
    var staff = this.GetStaff(StaffName);
    staff.UpdateAttendance(TimeStamp, Attendance);
  }
  
  CountPresent(Team)
  {
    var staffList = this.Teams.get(Team);
    var count = 0;

    for (let staff of staffList) {
      const upper = staff.AttendanceDetails[1].toUpperCase();
      if (upper.includes("PRESENT") || upper.includes("NSC")) {
        count++;
      }
    }

    return count;
  }
  
  
  // GetPrintText() {
  //   let output = `--${this.OfficeName}: (${this.CountPresent()}/${this.Staffs.size})--\n`;
  //   for (let [staffObj, attendanceDetails] of this.Staffs) {
  //     output += `${staffObj.StaffName}: ${attendanceDetails}\n`;
  //   }
  //   return output;
  // }

  Print()
  {
    // 1. Loop through each team and its array of staff members
    for (let [team, staffList] of this.Teams) {
      AddTeamElement(team, this.CountPresent(team), staffList.length);
      for (let staff of staffList) {
        AddElement(this.OfficeID, staff.AttendanceDetails[0], staff.StaffName, staff.AttendanceDetails[1], this.SpreadSheetID);
      }
    }
  }
}

class OfficeManager
{
  AllStaffs = new Map();
  OfficeList = new Map();

  constructor()
  {
  
  }

  AddOffice(OfficeID, OfficeName, SpreadSheetID)
  {
    this.OfficeList.set(OfficeID, new Office(OfficeName, OfficeID, SpreadSheetID));
  }

  AddStaff(OfficeID, StaffName, Team)
  {
    var office = this.OfficeList.get(OfficeID);

    if (office == undefined)
      return;

    office.AddStaff(StaffName, Team);
    this.AllStaffs.set(StaffName, OfficeID);
  }

  UpdateAttendance(TimeStamp, StaffName, Attendance)
  {
    var officeID = this.AllStaffs.get(StaffName);
    var office = this.OfficeList.get(officeID);

    if (office == undefined)
      return;

    office.UpdateAttendance(TimeStamp, StaffName, Attendance);
  }

  // GetPrintText() {
  //   let fullReport = "";
  //   for (let office of this.OfficeList.values()) {
  //     fullReport += office.GetPrintText() + "\n";
  //   }
  //   return fullReport;
  // }

  Print()
  {
    RemoveAllElements();
    for (let office of this.OfficeList.values()) {
      office.Print();
    }
  }
}

var officeManager = new OfficeManager();

function read_Office(SPREADSHEET_ID, Range) {
  var params = {
    spreadsheetId: SPREADSHEET_ID,
    range: Range,
  };

  return gapi.client.sheets.spreadsheets.values.get(params)
    .then(function(response) {
      var rows = response.result.values;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0])
          officeManager.AddOffice(rows[i][0], rows[i][1], SPREADSHEET_ID);
      }
    }, function(reason) {
      console.error('error: ' + reason.result.error.message);
    });
}

function read_Staffs(SPREADSHEET_ID, Range) {
  var params = {
    spreadsheetId: SPREADSHEET_ID,
    range: Range,
  };

  return gapi.client.sheets.spreadsheets.values.get(params)
    .then(function(response) {
    var rows = response.result.values;
    for (let i = 0; i < rows.length; i++)
    {
      if (rows[i][0])
        officeManager.AddStaff(rows[i][1], rows[i][0], rows[i][3])
    }

  }, function(reason) {
    console.error('error: ' + reason.result.error.message);
  });
}

function read_Attendance(SPREADSHEET_ID, Range) {
  var params = {
    spreadsheetId: SPREADSHEET_ID,
    range: Range,
  };

  return gapi.client.sheets.spreadsheets.values.get(params)
    .then(function(response) {
    var rows = response.result.values;
    for (let i = 0; i < rows.length; i++)
    {
      if (rows[i][0])
        officeManager.UpdateAttendance(rows[i][0], rows[i][1], rows[i][2])
    }

  }, function(reason) {
    console.error('error: ' + reason.result.error.message);
  });
}
