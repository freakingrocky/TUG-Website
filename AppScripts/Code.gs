function onOpen() {
  SpreadsheetApp.getUi().createMenu('Import Data').addItem('Import  Data', 'ImportFromFirestore').addToUi();
}

function getFirestore() {
  return FirestoreApp.getFirestore(/* CONFIG GOES HERE */)
}

function ImportFromFirestore() {
  const firestore = getFirestore()

  const allDocuments = firestore.query('TUG_stopwatch').OrderBy("time", "desc").Execute().map(function(document) {
    return document.fields;
  });

  const first = allDocuments[0]

  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const sheet = ss.getSheetByName('User Data')
  sheet.activate()
  sheet.clearContents()	
  sheet.appendRow(['Name', 'UID', 'Time (1st Time)', 'Timetaken 1', 'Time (2nd Time)', 'Timetaken 2'])

  allDocuments.forEach(function(document) {
    var done = false;
    try {const row = [document.name.stringValue, document.uid.stringValue, document.Time_fmt.stringValue, document.timetaken_c1.stringValue, document.Time_fmt_2.stringValue, document.timetaken_c2.stringValue]
    sheet.appendRow(row);
    done = true;}
    catch (e) {
      console.error('error: ' + e);
    }
    if (!done) {
      const row = [document.name.stringValue, document.uid.stringValue, document.Time_fmt.stringValue, document.timetaken_c1.stringValue, 'Not Available', document.timetaken_c2.stringValue]
      sheet.appendRow(row);
    }
  })

  const allFeedback = firestore.query('feedback').OrderBy("time", "desc").Execute().map(function(doc) {
    return doc.fields;  })

    const f = allFeedback[0]

    const s = ss.getSheetByName('Feedback')
    s.activate()
    s.clearContents()
    s.appendRow(['Name', 'UID', 'Time', 'Feedback'])

    allFeedback.forEach(function(feedback) {
      const r = [feedback.name.stringValue, feedback.uid.stringValue, feedback.time_fmt.stringValue, feedback.feedback.stringValue]

      s.appendRow(r)
    })

}
