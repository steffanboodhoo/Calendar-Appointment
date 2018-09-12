const CALENDAR = (function(){

	this.MONTH_NAMES = ["January", "February","March", "April","May", "June", "July", "August", "September", "October", "November", "December"];
	this.DAY_NAMES = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	this.WORK_HOURS = [
		[1,1,1,1,0,0,0,0,0,0],
		[1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,1,1],
		[1,1,1,1,1,1,1,1,0,0],
	];
	this.WORK_DAY = [8,9,10,11,12,13,14,15,16,17];
	let curr_date = new Date();
	this.date = {"month":curr_date.getMonth(), "year":curr_date.getFullYear(), "date":curr_date.getDate()};
	this.month_view = null;

	
	this.init = (id, cal_date) => {
		//CALENDAR VARIABLES
		START_DAY = getDay( 1, cal_date.month, cal_date.year); //set 'date' to be first day of the month
		MONTH_DAYS = getMonthDays( cal_date.month, cal_date.year );
		LAST_MONTH_DAYS = getMonthDays( cal_date.month-1, cal_date.year );
		//Today
		//last day on calendar
		month_query = {'branch_id':1,
		 'start_date':`${this.date['year']}-${this.date['month']}-${this.date['date']}`
		 , 'end_date':`${this.date['year']}-${this.date['month']+1}-${42-(START_DAY+MONTH_DAYS)}`};
		console.log(month_query)
		$.ajax();
		$.ajax({
			url:'localhost:1000/appointment_meta',
			method:'GET',
			data:month_query,
			success:function(resp){
				console.log(resp)
				}
			});
		
		this.month_data = this.create_month_data(cal_date.month, this.cal_date);
		this.create_month_view(id, this.month_data);
	}
	
	this.create_month_data = (curr_month, today) => {
		let month_data = [];
		CURR_MONTH_START_DAY = getDay(1, curr_month, this.date.year);
		CURR_MONTH_DAYS = getMonthDays(curr_month, this.date.year);
		LAST_MONTH_DAYS = getMonthDays(curr_month-1, this.date.year);

		let cal_pos = 0, pos_date = -1;
		for(let i=0; i<6; i++){
			month_data.push([])
			for(let j=0; j<7; j++){
				let day = {month:curr_month};
				//If last month
				if(cal_pos < CURR_MONTH_START_DAY){
					day['month']--;
					pos_date = LAST_MONTH_DAYS - (CURR_MONTH_START_DAY - (cal_pos + 1));
				//current month
				}else if(cal_pos < (CURR_MONTH_START_DAY + CURR_MONTH_DAYS) ){
					pos_date = (cal_pos+1) - CURR_MONTH_START_DAY;
				//Next month
				}else{
					pos_date = (cal_pos+1) - (CURR_MONTH_START_DAY + CURR_MONTH_DAYS);
					day['month']++;
				}
				day['date'] = pos_date;
				day['id'] = day['month'] + '_' +day['date'];
				month_data[i].push(day);
				cal_pos++;
			}
		}
		return month_data;
	}

	this.create_month_view = (id, month_data = this.month_data) =>{
		let month_view = $('<div>');
		//Create Header for month view
		month_view.append( this.createHead() );
		month_view.append( this.create_month_body(month_data) );
		this.month_view = month_view;
		$(id).append( this.month_view );
	}
	
	this.createNavigation = ()=>{
		
	}

	//-------------------------------MONTH MANIPULATIONS-------------------------------
	//---------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------
	this.createHead = () =>{
		let cal_head = $('<div>',{'id':'cal-head'});
		let cal_title = $('<div>',{id:'cal-title'}).append('<h3>'+this.MONTH_NAMES[this.date.month]+'</h3>');
		cal_head.append(cal_title);
		return cal_head;
	}
	
	this.create_month_body = (month_data) =>{
		let month_cont = $('<div>',{class:'flex-col'});
		month_cont.append(this.create_day_headings());
		for(let i=0; i<6; i++){
			let row = $("<div>",{class:'flex-row'});//CREATE ROW|WEEK
			for(let j=0; j<7; j++){
				row.append( this.create_month_day(month_data[i][j]) );
			}
			month_cont.append(row);
		}
		return month_cont;
	}
	this.create_month_day = (day) => {
		let day_elem = $("<div>",{id:day['id'], class:'day unselected'});
		day_elem.append( $('<p>').append(day['date']) );
		day_elem.on("click", this.elementClick);
		day_elem.on("mouseenter mouseexist", this.elementHover);
		return day_elem;
	}

	this.create_day_headings = () =>{
		let day_labels = $('<div>',{'class':'flex-row'})
		for(let j=0; j<7; j++){
			let label = this.DAY_NAMES[j].slice(0,3);
			day_labels.append( $('<div>',{'class':'day'}).append(label) );
		}
		return day_labels;
	}

	this.elementClick = function(){
		$('#'+this.id).removeClass("unselected").addClass("selected")
		console.log(this.id);
		createDayView(this.id)
	}
	this.setElementClick = ( func )=>{
		this.elementClick = func;
	}


	this.elementHover = function(){
		console.log("default hover"+this);
	}
	this.setElementHover = ( func ) =>{
		this.elementHover = func;
	}
	//-------------------------------DAY VIEW-----------------------------------------
	//---------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------	
	this.createDayView = (id)=>{
		let [selected_month, selected_day] = id.split('_').map( el => parseInt(el));
		let selected_year = this.date.year;
		let work_hours = this.WORK_HOURS[ getDay(selected_day, selected_month, selected_year) ];

		let day_view = $('<div>',{'class':'flex-col'});
		let day_head = $('<div>').append(' Back ').click(()=>{
			$('#calendar').empty();	
			this.create_month_view('#calendar');
		});
		day_view.append(day_head);

		let hours = $('<div>',{'class':'flex-col'});
		hours.append(work_hours.map( (el,i) => {
			let hour_elem = $('<div>',{'class':`hour ${el?'unselected':'disabled'}`});
			hour_elem.append(`${this.WORK_DAY[i]>12?this.WORK_DAY[i]-12:this.WORK_DAY[i]} ${(this.WORK_DAY[i]>=12)?'PM':'AM'}`);
			hour_elem.click((ev)=>{		
				if(ev.target.className.includes('disabled'))
					return;
				$('#modal_appointment_confirm').modal('show');	
				// console.log({selected_day, selected_month, selected_year, 'hour':this.WORK_DAY[i]});
			})
			return hour_elem;
		}));
		day_view.append(hours);
		
		$('#calendar').empty().append(day_view)
	}

	//-------------------------------UTILITIES-----------------------------------------
	//---------------------------------------------------------------------------------
	//---------------------------------------------------------------------------------		

	function getDay(day, month, year){
		let date = new Date(year, month, day); 
		return date.getDay();	//returns day of the week of 'date'
	}

	function getMonthDays(month, year){
		// the 0'th day is the number of days in the previous month, so we use the next month to get the number of days in the current 
		let date = new Date(year, month+1, 0); 
		// No need to worry about december, the Date object handles overflow nicely
		return date.getDate();
	}
	

	//------------------------------------MODALS----------------------------------------
	//----------------------------------------------------------------------------------
	//----------------------------------------------------------------------------------
	

	return this;
	console.log("everything Loaded"); 
})();