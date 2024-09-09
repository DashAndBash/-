const {ipcRenderer} = require('electron');
document.addEventListener('DOMContentLoaded', () => {
	// 이 안에서 DOM을 조작하는 코드를 작성
	const AppButton:HTMLDivElement[] = Array.from(document.querySelectorAll(".AppButton"));
	const LinkButton:HTMLDivElement[] = Array.from(document.querySelectorAll(".LinkButton"));
	if (AppButton) {
		console.log(AppButton);
		AppButton.forEach(element => {
			element.addEventListener("click",ExecuteClient);
		});
	}
	if (LinkButton) {
		console.log(LinkButton);
		LinkButton.forEach(element => {
			element.addEventListener("click",ExecuteWebsite);
		});
	}
});

function ExecuteWebsite(event){
	const Data = {type:"Website",path:event.target.dataset.path};
	ipcRenderer.send('asynchronous-message',Data);
}

function ExecuteClient(event){
	console.log(event.target.dataset.path);
	const Data = {type:"WindowExe",path:event.target.dataset.path};
	ipcRenderer.send('asynchronous-message',Data);
}

function RequireTextdata(){
	const Data = {type:"TxtRead",path:"./SchoolSchedule data/data.txt"};
	ipcRenderer.send('asynchronous-message',Data);
}
ipcRenderer.on('asynchronous-message', (event, arg:string) => {
	const Schedule = arg.split("==\r\n")
	console.log(Schedule);
	ScheduleAlign(Schedule);
})
function ScheduleAlign(Schedule){
	const Mon = new MySchedule();
	const Tue = new MySchedule();
	const Wed = new MySchedule();
	const Thu = new MySchedule();
	const Fri = new MySchedule();

	
	const Contexts = [Fri,Thu,Wed,Tue,Mon];
	let CurrntDay = Mon;
	Schedule.forEach(element => {
		//요일은 괄호로 묶어놨다.
		if(element[0] == "("){
			CurrntDay = Contexts.pop();
		}
		else{
			const splitedElement = element.split("\r\n");
			const eleName = splitedElement[0];
			const eleTime = splitedElement[1];
			CurrntDay.NewSchedule({name:eleName , time:eleTime});
		}
	});
	console.log("mon:",Mon,"\ntue:",Tue,"\nWed:",Wed,"\nThu:",Thu,"\nfri:",Fri);
	AsignText(Fri,Thu,Wed,Tue,Mon);
	setInterval(()=>AsignText(Fri,Thu,Wed,Tue,Mon),60000);
}


function AsignText(Fri:MySchedule,Thu:MySchedule,Wed:MySchedule,Tue:MySchedule,Mon:MySchedule){
	const NextSchedule= document.querySelector("#NextSchedule");
	const Time:Date = new Date();
	const Today = Time.getDay();
	NextSchedule.textContent = "----";
	if (Today === 0 || Today === 6){
		//주말이다. 필요없어 보이지만 예외처리를 위해 필요함.
		return;
	}
	const Contexts =[Mon,Tue,Wed,Thu,Fri];
	const DailysSchedule:MySchedule = Contexts[Today - 1];
	for(let i = 0; i < DailysSchedule.Daily.length; i++){
		const ScheduleTime = DailysSchedule.getIntTime(i);
		if(Time.getHours() < ScheduleTime.Hour
		||(Time.getHours() == ScheduleTime.Hour && Time.getMinutes() < ScheduleTime.Minute)){
			NextSchedule.textContent = DailysSchedule.Daily[i].name;
			NextSchedule.addEventListener("mouseover", function() {
				NextSchedule.textContent = DailysSchedule.Daily[i].time;
			});
			NextSchedule.addEventListener("mouseout", function() {
				NextSchedule.textContent = DailysSchedule.Daily[i].name;
			});
			break
		}
	}
}

class MySchedule{
	Daily:{name:string,time:string}[];

	constructor(){
		this.Daily=[];
	}
	NewSchedule(Schedule:{name:string,time:string}){
		this.Daily.push(Schedule);
	}
	getIntTime(number:number){
		const Target:{name:string,time:string} = this.Daily[number];
		const HH = Target.time.slice(0,2);
		const MM = Target.time.slice(3);
		const IntTime:{Hour:number,Minute:number} = {Hour:parseInt(HH),Minute:parseInt(MM)};
		return IntTime;
	}
}

RequireTextdata();