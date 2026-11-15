// Independent zero-model positive controls, never supplied to the live model.
export const SOURCES:Record<string,string>={
 M01:'root = Column([Text("src/app.ts:42"),Button(Text("Inspect file"),action=Event("inspect",{file:"src/app.ts",line:42}))])',
 M02:'$/name = ""\n$/accept = false\nname = TextField(label="Name",value=$/name)\naccept = CheckBox(label="Accept",value=$/accept)\nsave = Button(Text("Save form"),action=Event("save",{name:$/name,accept:$/accept}))\nguard = FormValidation(buttons=["save"],rules=[{fieldId:"name",required:true,minLength:2,maxLength:5,message:"Name2to5"},{fieldId:"accept",required:true,message:"Accept required"}])\nroot = Column([name,accept,guard,save])',
 M03:'$/notify = false\n$/priority = 2\n$/mode = ["safe"]\n$/date = "2026-11-15"\nroot = Column([CheckBox(label="Notify",value=$/notify),Slider(label="Priority",min=1,max=5,steps=4,value=$/priority),ChoicePicker(label="Mode",variant="mutuallyExclusive",options=[{label:"Fast",value:"fast"},{label:"Safe",value:"safe"}],value=$/mode),DateTimeInput(label="Date",value=$/date,enableDate=true,enableTime=false),Button(Text("Save settings"),action=Event("settings",{notify:$/notify,priority:$/priority,mode:$/mode,date:$/date}))])',
 M04:'root = DataTable(caption="Scores",columns=[{id:"row",label:"Row"},{id:"score",label:"Score"}],rows=[{id:"a",cells:["A",10]},{id:"b",cells:["B",2]},{id:"c",cells:["C",2]}])',
 M05:'root = CodeBlock(code="const answer = 42;",language="typescript")',
 M06:'root = MarkdownView(text="# Notes\\n\\n**Ready** to review.")',
 M07:'root = Column([Details(title="More info",child=Text("Build 42"),open=false),Modal(trigger=Text("Open details"),content=Text("Review carefully"))])',
 M08:'$/target = ["alpha"]\nroot = Column([SearchablePicker(label="Target",options=[{label:"Alpha",value:"alpha"},{label:"Beta",value:"beta"}],value=$/target),Button(Text("Choose target"),action=Event("choose",{target:$/target}))])',
 M09:'root = Column([Chart(kind="bar",series=[{name:"Requests",points:[{label:"Mon",value:-2},{label:"Tue",value:3}]}]),Button(Text("Refresh chart"),action=Event("refresh",{series:"Requests"}))])',
 M10:'root = Column([CodeDiff(proposalId="p-bm4",filename="example.ts",baseRevision="base-bm4",before="old",after="new"),TestResults(resultId="r-bm4",command="fixture",evidence="Illustrative only",cases=[{id:"unit",name:"Unit",status:"pass"},{id:"lint",name:"Lint",status:"fail"}],summary={pass:1,fail:1,skip:0,error:0}),Button(Text("Inspect result"),action=Event("inspect_test",{id:"lint",proposalId:"p-bm4",resultId:"r-bm4"}))])',
 M11:'root = Column([TaskProgress(stream="tools"),ActivityTimeline(stream="tools")])',
 M12:'root = Column([ArtifactPreview(src="ARTIFACT_SRC",kind="image",label="Sample image"),Image(url="ARTIFACT_SRC",description="Sample image")])',
};
export const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a2a0AAAAASUVORK5CYII=','base64');

export function bindingVariant(id:string):string {
 if(id==='M01')return '$/button = "Inspect file"\n'+SOURCES.M01.replace('Button(Text("Inspect file")','Button(Column([Text(text=$/button)])');
 if(id==='M02')return '$/label = "Name"\n'+SOURCES.M02.replace('$/name = ""','$/form = {"name/value":""}').replaceAll('$/name','{"@path":"/form/name~1value"}').replace('label="Name"','label=$/label');
 throw new Error('unknown binding control');
}
