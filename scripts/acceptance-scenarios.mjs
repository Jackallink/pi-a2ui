// Deterministic inputs for the real-model/browser acceptance runner.
export const formsSource = `$/form/name = ""
$/form/enabled = false
$/form/count = 2
$/form/features = ["a"]
$/form/date = "2026-11-13"
root = Column([TextField("Acceptance phrase", $/form/name), CheckBox("Enabled", $/form/enabled), Slider(label="Count", min=0, max=10, steps=10, value=$/form/count), ChoicePicker(label="Features", variant="multipleSelection", options=[{label:"Alpha",value:"a"},{label:"Beta",value:"b"}], value=$/form/features), DateTimeInput($/form/date,enableDate=true,enableTime=false,label="Date"), Button(Text("Submit acceptance"),action=Event("submit",{name:$/form/name,enabled:$/form/enabled,count:$/form/count,features:$/form/features,date:$/form/date}))])`;
export async function fillForms(page) {
  await page.getByRole('checkbox',{name:'Enabled',exact:true}).check();
  await page.getByRole('slider').evaluate(e=>{e.value='7';e.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.getByRole('checkbox',{name:'Alpha',exact:true}).uncheck();
  await page.getByRole('checkbox',{name:'Beta',exact:true}).check();
  await page.locator('input[type=date]').fill('2026-12-25');
}
export function codingSource(report){return `$/form/name = ""
root = Column([TextField("Acceptance phrase", $/form/name), CodeDiff(proposalId="proposal-live",filename="arithmetic.test.mjs",baseRevision="empty-file",before="",after=${JSON.stringify(report.source)}), TestResults(resultId="result-live",command="node --test --test-reporter=tap arithmetic.test.mjs",evidence="Acceptance runner observed exit0 and TAP pass1; supplied by Pi",cases=[{id:"arithmetic",name:"Arithmetic",status:"pass",details:"Observed assertion: 2 + 2 equals 4"}],summary={pass:1,fail:0,skip:0,error:0}), Button(Text("Submit acceptance"),action=Event("submit",{name:$/form/name,proposalId:"proposal-live",resultId:"result-live"}))])`;}
export const liveSource=`$/form/name = ""
chart = Chart(kind="bar",series=[])
root = Column([TextField("Acceptance phrase",$/form/name),LogView(stream="tools"),chart,Button(Text("Submit acceptance"),action=Event("submit",{name:$/form/name}))])`;
export const liveChartSeries=[{name:'Ticks',points:[{label:'tick-1',value:1},{label:'tick-2',value:2},{label:'tick-3',value:3}]}];
