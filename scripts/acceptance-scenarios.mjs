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
