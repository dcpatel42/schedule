const moment = require('moment/moment');
const { log } = require('node:console');
const { createServer } = require('node:http');
const readXlsxFile = require('read-excel-file/node')
moment.suppressDeprecationWarnings = true;
const schema = {
    'Day': {
      prop: 'day',
      type: String,
    },
    'Date': {
      prop: 'date',
      type: Date,
      type: (value) => {
        const newDate = moment.utc(value).format('DD-MMM-YYYY')
        if(value == undefined){
          value = "OFF"
        }
        if (!newDate) {
          throw new Error('invalid date')
        }
        return newDate
      }
    },
    'Department': {
      prop: 'department',
      type: String,
      oneOf: [
              'Cook',
              'Pizza',
              'Salad',
              'Closer',
              'Cook / Closer',
              'Salad / Closer',
              'Starbucks',
              'OFF'
      ]
    },
    'Time': {
      prop: 'time',
      type: String,
    }
}
// File path.
readXlsxFile('./TIME TABLE.xlsx',{schema, sheet: 2 }).then(({rows, errors}) => {
  // console.log(rows);
  const newData = rows.map((row, index) => {
    const container = [];
    if(row.department !== undefined){
      
      container['day'] = row.day; // Day from sheet
      container['date'] = row.date; // Date from sheet
      
      container['department'] = row.department; // Department
      
      container['startShift'] =  "OFF"; // Set startTime default (Off)
      container['endShift'] =  "OFF"; // Set endTime default (Off)
      container['attendance'] =  0; // Set atteedance default (zero)

      paidHoursCalculate = 0;
      if(row.department !== 'OFF'){

        let splitDate = row.time.split(' - '); // split time from timetable

        container['startShift'] =  splitDate[0];
        container['endShift'] =  splitDate[1];
        container['attendance'] =  1;
        // set date in variable to calculate total & working hours.
        let startShift = moment(row.date +" "+ splitDate[0]); 
        let endShift = moment(row.date +" "+ splitDate[1]); 
        
        let timeDuration = moment.duration(startShift.diff(endShift));
        let Totalhours = Math.abs(timeDuration.asHours());

        container['Totalhours'] = Totalhours;
        // Remove break time from total hours.
          if(Totalhours > 8){
            container['paidHours'] =  Totalhours - 0.5;
          }else if(Totalhours > 6){
            container['paidHours'] =  Totalhours - 0.5;
          }else{
            container['paidHours'] =  Totalhours;
          }
        }
      console.log(container);
      
      return container;
    }

  });

const filterData = newData.filter(function(e) {
    return e !== undefined;
  });
  // console.log(filterData);
})



const hostname = '127.0.0.1';
const port = 3000;

const server = createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
