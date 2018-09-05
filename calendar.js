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
		cal_date.START_DAY = getDay( 1, cal_date.month, cal_date.year); //set 'date' to be first day of the month
		cal_date.MONTH_DAYS = getMonthDays( cal_date.month, cal_date.year );
		cal_date.LAST_MONTH_DAYS = getMonthDays( cal_date.month-1, cal_date.year );
		
		let month_view = $('<div>');
		//Create Header for month view
		month_view.append( this.createHead() );
		month_view.append( this.createBody(cal_date) );
		this.month_view = month_view;
		$(id).append( this.month_view );
		console.log("end of running");
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
	this.createBody = (START_DAY, MONTH_DAYS)=>{
		let cont = $('<div>',{class:'flex-col'})
		//HEAD
		let day_labels = $('<div>',{'class':'flex-row'})
		for(let j=0; j<7; j++)
			day_labels.append( $('<div>',{'class':'day'}).append(abbrv(this.DAY_NAMES, j)) );
		cont.append(day_labels);

		//BODY
		var count = 0, calendar = [];
		for(let i = 0; i<6; i++){//6 weeks in calendar to account for month starting at the end of the week
			calendar[i] = [];
			row = $("<div>",{class:'flex-row'});
			
			for(let j=0; j<7; j++){// 7 days in a week
				let cal_pos = (i*7)+j;
				var [elem, count] = this.createDay(cal_pos, count, this.date);
				row.append(elem);
			}
			// console.log("moo");
			cont.append(row);
		}
		return cont;
	}



	this.createDay = (cal_pos, count, cal_date)=>{
		// let classnames = 'day '?(cal_pos<)

		let day_elem = $("<div>",{class:'day unselected'}), pos_date;
		
		//PRE MONTH
		if( cal_pos < cal_date.START_DAY ){ //if the current calendar position is less than the first day of current month
			pos_date = cal_date.LAST_MONTH_DAYS - ( cal_date.START_DAY - cal_pos - 1);
			day_elem.attr({"id":(this.date.month-1)+"_"+pos_date})
		//CURRENT MONTH OR FUTURE MONTH
		}else{
			count++;	
			pos_date = count;
			if( cal_pos >= (cal_date.MONTH_DAYS+cal_date.START_DAY)) //NEXT MONTH
				day_elem.attr({"id":(this.date.month+1)+"_"+pos_date})
			else
				day_elem.attr({"id":(this.date.month)+"_"+pos_date})			//CURRENT MONTH
		}


		day_elem.append( $('<p>').append(pos_date) )
		day_elem.on("click", this.elementClick);
		day_elem.on("mouseenter mouseexist", this.elementHover);

		//WE HAVE ARRIVED AT THE END OF THIS MONTH
		if( count == cal_date.MONTH_DAYS )
			count = 0;
		return [day_elem, count];
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
			this.init('#calendar', this.date);
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
	function abbrv( list, index){
		return list[index].slice(0,3);
	}

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