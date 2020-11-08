/**
 * Module Dependencies
 */
import React from 'react';
import moment from 'moment';
import validator from 'validator';

// MaterialUI Components and Icons
import { makeStyles } from '@material-ui/core/styles';
import { Paper, Grid, Button, Typography, Box } from '@material-ui/core';
import Snackbar from '@material-ui/core/Snackbar';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiAlert from '@material-ui/lab/Alert';

// formik and formik-material-ui
import { Formik, Form, Field } from 'formik';

import MaterialTable from 'material-table';
import { TextField } from 'formik-material-ui';
import { DatePicker } from 'formik-material-ui-pickers';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import DateFnsUtils from '@date-io/date-fns';

// Redux Components
import { connect } from 'react-redux';

import {
  loadDailyReport,
  updateDailyReport,
  updateDailyReportRefund,
} from '../redux/thunks/reportThunks';

import { logoutStaff } from '../redux/thunks/authThunks';

import {
  snackBarFail,
  snackBarSuccess,
  snackBarClose,
} from '../redux/actions/actions';

// Components
import FullPageLoader from '../components/FullPageLoader';
import NavBar from '../components/NavBar';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  search: {
    width: '30%',
    marginBottom: '1em',
    padding: theme.spacing(1),
  },
  refund: {
    marginTop: '1em',
    padding: theme.spacing(1),
  },
}));

/**
 * Stateless Component to Render MaterialUI Alert
 */
function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

/**
 * Render the Daily Report Component
 * @param {Object} param Redux State, Actions, and Thunks
 */
const Report = ({
  auth,
  loading,
  snackBar,
  report,
  reportDate,
  refundSum,
  refundNotes,
  logout,
  loadReport,
  updateReport,
  updateReportRefund,
  snackBarSucceed,
  snackBarFailed,
  closeSnackBar,
}) => {
  const classes = useStyles();

  const [selectedRow, setSelectedRow] = React.useState(null);

  const columns = [
    {
      title: 'Room',
      field: 'RoomID',
      type: 'string',
      editable: 'never',
    },
    {
      title: 'T',
      field: 'type',
      type: 'string',
      cellStyle: {
        maxWidth: 50,
      },
      headerStyle: {
        maxWidth: 50,
      },
    },
    {
      title: 'P',
      field: 'payment',
      type: 'string',
      cellStyle: {
        maxWidth: 50,
      },
      headerStyle: {
        maxWidth: 50,
      },
    },
    {
      title: 'Start',
      field: 'startDate',
      type: 'date',
      cellStyle: {
        minWidth: 150,
      },
      headerStyle: {
        minWidth: 150,
      },
    },
    {
      title: 'End',
      field: 'endDate',
      type: 'date',
      cellStyle: {
        minWidth: 150,
      },
      headerStyle: {
        minWidth: 150,
      },
    },
    {
      title: 'Paid',
      field: 'paid',
      type: 'boolean',
      cellStyle: {
        maxWidth: 60,
      },
      headerStyle: {
        maxWidth: 60,
      },
    },
    {
      title: 'Notes',
      field: 'notes',
      type: 'string',
      cellStyle: {
        minWidth: 200,
      },
      headerStyle: {
        minWidth: 200,
      },
    },
    { title: 'Rate', field: 'rate', type: 'numeric' },
    { title: 'Tax', field: 'tax', type: 'numeric' },
    {
      title: 'In',
      field: 'initial',
      type: 'string',
      cellStyle: {
        maxWidth: 75,
      },
      headerStyle: {
        maxWidth: 75,
      },
    },
  ];

  return (
    <div className={classes.root}>
      <CssBaseline />
      <NavBar logout={logout} userInfo={auth.user} />
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <>
          <Snackbar
            open={snackBar.open}
            autoHideDuration={2000}
            onClose={closeSnackBar}
          >
            <Alert severity={snackBar.alert}>{snackBar.message}</Alert>
          </Snackbar>
          <FullPageLoader loading={loading} />
          <Grid
            container
            direction="row"
            justify="space-between"
            alignItems="center"
          >
            <Typography variant="h5">
              <Box fontWeight="fontWeightBold">
                {`Daily Report for ${moment(reportDate, 'YYYY-MM-DD').format(
                  'dddd, MMMM Do YYYY'
                )}`}
              </Box>
            </Typography>
            <Paper elevation={3} className={classes.search}>
              <MuiPickersUtilsProvider utils={DateFnsUtils}>
                <Formik
                  initialValues={{
                    reportSearch: moment(),
                  }}
                  validate={(values) => {
                    const errors = {};

                    if (moment().isBefore(values.reportSearch)) {
                      snackBarFailed('Not a Valid Date');
                      errors.reportSearch = 'Not a Valid Date';
                    }

                    return errors;
                  }}
                  onSubmit={(values, { setSubmitting }) => {
                    setSubmitting(true);

                    loadReport(
                      moment(values.reportSearch).format('YYYY-MM-DD')
                    );
                    setSubmitting(false);
                  }}
                >
                  {({ submitForm }) => (
                    <Form>
                      <Grid
                        container
                        justify="space-around"
                        alignItems="center"
                      >
                        <Grid item xs={8}>
                          <Field
                            fullWidth
                            component={DatePicker}
                            variant="outlined"
                            name="reportSearch"
                            label="Date"
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={submitForm}
                          >
                            Search
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </MuiPickersUtilsProvider>
            </Paper>
          </Grid>
          <MaterialTable
            columns={columns}
            data={report}
            // eslint-disable-next-line no-shadow
            onRowClick={(evt, selectedRow) => {
              setSelectedRow(selectedRow.tableData.id);
              if (selectedRow.BookingID !== 0) {
                snackBarSucceed(`BookingID: ${selectedRow.BookingID}`);
              }
            }}
            options={{
              search: false,
              toolbar: false,
              paging: true,
              headerStyle: {
                fontWeight: 'bold',
              },
            }}
            editable={{
              isEditable: (rowData) => rowData.BookingID,
              isDeletable: (rowData) => rowData.BookingID,
              onRowUpdate: (newData) =>
                new Promise((resolve, reject) => {
                  setTimeout(() => {
                    /**
                     * Error Validation
                     */
                    if (newData.paid) {
                      if (newData.endDate.length === 0) {
                        reject();
                        // eslint-disable-next-line no-undef
                        alert('Must Specify End Date');
                        return;
                      }
                    }

                    if (moment(newData.endDate).isBefore(newData.startDate)) {
                      /**
                       * Calling snackBarFailed(msg) does not render properly
                       */
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('End Date Cannot be Before Start Date');
                      return;
                    }

                    if (newData.tax && parseFloat(newData.tax) < 0) {
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('Tax Cannot be Less than 0');
                      return;
                    }

                    if (newData.rate && parseFloat(newData.rate) < 0) {
                      reject();
                      // eslint-disable-next-line no-undef
                      alert('Rate Cannot be Less than 0');
                      return;
                    }

                    if (newData.initial) {
                      newData.initial = newData.initial.trim();
                      if (newData.initial.trim().length > 2) {
                        reject();
                        // eslint-disable-next-line no-undef
                        alert('Not A Proper Initial');
                        return;
                      }
                    }

                    if (newData.type) {
                      newData.type = newData.type.trim();
                      if (newData.type.length > 4) {
                        reject();
                        // eslint-disable-next-line no-undef
                        alert('Not A Proper Type');
                        return;
                      } else if (
                        newData.type !== 'N' &&
                        newData.type !== 'S/O' &&
                        newData.type !== 'WK1' &&
                        newData.type !== 'WK2' &&
                        newData.type !== 'WK3' &&
                        newData.type !== 'NO'
                      ) {
                        reject();
                        // eslint-disable-next-line no-undef
                        alert('Not A Proper Type. Must be N, S/O, WK, or NO');
                        return;
                      }
                    }

                    if (newData.payment) {
                      newData.payment = newData.payment.trim();
                      if (newData.payment.length > 2) {
                        reject();
                        // eslint-disable-next-line no-undef
                        alert('Not A Proper Payment. Either C or CC');
                        return;
                      } else if (newData.payment !== 'C' && newData.payment !== 'CC') {
                        reject();
                        // eslint-disable-next-line no-undef
                        alert('Not A Proper Payment. Either C or CC');
                        return;
                      }
                    }

                    // Set Default Values for Required Fields
                    const submitData = newData;
                    submitData.rate = validator.isNumeric(`${newData.rate}`)
                      ? newData.rate
                      : '0';
                    submitData.tax = validator.isNumeric(`${newData.tax}`)
                      ? newData.tax
                      : '0';

                    updateReport(reportDate, submitData);
                    resolve();
                  }, 100);
                }),
            }}
          />
          <Paper elevation={3} className={classes.refund}>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <Formik
                enableReinitialize
                initialValues={{
                  refundAmount: refundSum ? refundSum : 0,
                  comments: refundNotes ? refundNotes: '',
                }}
                onSubmit={(values, { setSubmitting }) => {
                  setSubmitting(true);
                  updateReportRefund({
                    date: reportDate,
                    amount: values.refundAmount,
                    notes: values.comments,
                  });
                  setSubmitting(false);
                }}
              >
                {({ submitForm }) => (
                  <Form>
                    <Grid
                      container
                      spacing={3}
                      justify="space-around"
                      alignItems="center"
                    >
                      <Grid item xs={2}>
                        <Field
                          fullWidth
                          component={TextField}
                          variant="outlined"
                          name="refundAmount"
                          label="Refund"
                        />
                      </Grid>
                      <Grid item xs={7}>
                        <Field
                          fullWidth
                          component={TextField}
                          variant="outlined"
                          name="comments"
                          label="Comments"
                        />
                      </Grid>
                      <Grid item xs={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          color="primary"
                          onClick={submitForm}
                        >
                          Submit
                        </Button>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </MuiPickersUtilsProvider>
          </Paper>
        </>
      </main>
    </div>
  );
};

const mapStateToProps = (state) => ({
  auth: state.authState,
  reportDate: state.reportState.date,
  report: state.reportState.report,
  refundSum: state.reportState.refundAmount,
  refundNotes: state.reportState.refundComments,
  snackBar: state.snackBarState,
  loading: state.loadingState.isLoading,
});

const mapDispatchToProps = (dispatch) => ({
  logout: (redirect) => dispatch(logoutStaff(redirect)),
  loadReport: (date) => dispatch(loadDailyReport(date)),
  updateReport: (date, data) => dispatch(updateDailyReport(date, data)),
  updateReportRefund: (refund) => dispatch(updateDailyReportRefund(refund)),

  snackBarSucceed: (msg) => dispatch(snackBarSuccess(msg)),
  snackBarFailed: (msg) => dispatch(snackBarFail(msg)),
  closeSnackBar: () => dispatch(snackBarClose()),
});

export default connect(mapStateToProps, mapDispatchToProps)(Report);
