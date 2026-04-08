import * as React from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { addEmpleado } from '../../utils/postFunctions';
import Button  from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import { Typography } from '@mui/material';
/* Custom Themes for buttons */
import {theme} from '../../utils/themes'
import {ThemeProvider} from "@mui/material/styles";
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import MoneyOffIcon from '@mui/icons-material/MoneyOff';
import ClearIcon from '@mui/icons-material/Clear';
import DeleteIcon from '@mui/icons-material/Delete';
import ProyectoGasto from './ProyectoGasto';
import AlertDialog from '../AlertDialog';
import statusDELETE from '../../utils/statusDELETE';
import axios from 'axios';
import { scrollFunction } from '../../utils/scrollFunction';
import PaidIcon from '@mui/icons-material/Paid';


export default function EmpleadosProyecto(props){


  const OPTIONS = {

    BONO:         Symbol("BONO"),
    TRASLADO:     Symbol("TRASLADO"),
    DESCUENTO:    Symbol("DESCUENTO"),
  }


  /*  STATE VARIABLES */
  const [rows, setRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [option, setOption] = React.useState(null);  
  const [empleadoID, setEmpleadoID] = React.useState();
  const [clickedRow, setClickedRow] = React.useState();

  const [del, setDel] = React.useState(false);

  const [openDialog, setOpenDialog] = React.useState(false)
  const [nombre, setNombre] = React.useState(null)














    const cols = [                                                             
        {field:'id',       headerName:'ID',        width:40},
        {field:'nombre',   headerName:'Nombre',    width:300},
        {field:'rut',      headerName:'RUT',       width:200},
        

        {
            field: "bono",
            headerName: "Bono",
            sortable: false,
            width: 80,

            
            renderCell: (params) => {
                return (
                    <ThemeProvider theme={theme}>
                        <Button variant='contained'
                                size='small'
                                color='green'
                              onClick={function(){setOption('bono');setOpen(true);}}>
                          <AttachMoneyIcon/>
                      </Button>
                  </ThemeProvider>
              );
          } 
      },



      {
          field: "descuento",
          headerName: "Descuento",
          sortable: false,
          width: 80,

          
          renderCell: (params) => {
              return (
                  <ThemeProvider theme={theme}>
                      <Button variant='contained'
                              size='small'
                              color='error'
                              onClick={function(){setOption('descuento');setOpen(true);}}>
                          <MoneyOffIcon/>
                      </Button>
                  </ThemeProvider>
              );
          } 
      },

      

      // HERE 
      {
          field: "anticipo",
          headerName: "Anticipo",
          sortable: false,
          width: 80,

          
          renderCell: (params) => {
              return (
                  <ThemeProvider theme={theme}>
                      <Button variant='contained'
                              size='small'
                              color='yellow'
                              onClick={function(){setOption('anticipo');setOpen(true);}}>
                          <PaidIcon/>
                      </Button>
                  </ThemeProvider>
              );
          } 
      },

      
    {
      field: "eliminar",
      headerName: "Eliminar",
      sortable: false,
      width: 80,
      renderCell: (params) => {
        return (
          <ThemeProvider theme={theme}>
              <Button variant='outlined' size='small' color='error'   onClick={function(){setOpenDialog(true)}}><DeleteIcon/></Button>
          </ThemeProvider>
        );
      } 
    },

    {
      field: "activo",
      headerName: "Estado",
      sortable: false,
      width: 80,
      renderCell: (params) => {
        return (
          <ThemeProvider theme={theme}>
                <Button 
                    variant='outlined'
                    size='small'
                    color='error'
                    onClick={function(){setOpenDialog(true)}}>
                    ACTIVO
                </Button>
          </ThemeProvider>
        );
      } 
    }
  ]   
  

  React.useEffect(()=>{

    scrollFunction('ProyectoScroll');

  },[empleadoID]);




  
  
    const getData = async () => {

        const url = `http://localhost:8000/proyecto/empleados/${props.proyectoID}`;
        const res = await axios.get(url);
        setRows(res.data.data);
    }



    /* Executed at component rendering */
    React.useEffect(()=>{


        getData();

    }, []);

    const deleteData = async () => {

        const url = `http://localhost:8000/proyecto/delete/proyectoid/${props.proyectoID}/empleadoid/${empleadoID}`;

        try{

            const res = await axios.delete(url);
            if(res.status == 200){

                console.log(res);
                props.notify("Empleado borrado exitosamente")
                getData();
            }

        }
        catch(err){

            props.notify("No se pudo borrar al empleado","error");


        }
    }


    /* Executed at component rendering */
    React.useEffect(()=>{

        if(!del) return;

        deleteData();

        setDel(false);

    }, [del]);



    return (
        <>

            <AlertDialog 
                handleClose={()=>setOpenDialog(false)} 
                content={`Confirme que desea eliminar al empleado del proyecto`}
                open={openDialog} 
                accept={()=>setDel(true)}/>

            <ProyectoGasto proyectoID={props.proyectoID} empleadoID={empleadoID} operacion={option} operaciones={OPTIONS} open={open} close={()=>setOpen(false)} {...props}/>

            
            <Typography variant="body2">
                Empleados que son parte de este proyecto 
            </Typography>
            <div style={{ height: 750, width: '100%' }}>
                <DataGrid
                    onRowClick={(selection)=>{setEmpleadoID(selection.id);setNombre(selection.nombre);}}
                    rows={rows}
                    rowHeight={35}
                    columns={cols}
                    pageSize={15}
                    rowsPerPageOptions={[15]}
                />
            </div>
            <br/>
            <br/> 
        </>
    );
}
