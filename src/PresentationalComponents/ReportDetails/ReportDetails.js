import React from 'react';
import PropTypes from 'prop-types';

import AsyncComponent from '@redhat-cloud-services/frontend-components/AsyncComponent';

// Reference: https://github.com/RedHatInsights/frontend-components/blob/master/packages/inventory-insights/src/ReportDetails/ReportDetails.js
// Rule fields processing: https://docs.google.com/document/d/1D0ZLD6-2DZqBX1cUHJY2vL2QAD0dIAzY3O3xFNlEsVg/edit?usp=sharing

const MyCmp = () => (
  <AsyncComponent appName="advisor" module="./AdvisorReportDetails" />
);

const ReportDetails = ({ report }) => (
  <MyCmp report={{ ...report, details: report.extra_data }} />
);

/*
    <Card>
      <CardBody>
        <Stack hasGutter>
          <StackItem>
            <Card className="ins-m-card__flat">
              <CardHeader>
                <BullseyeIcon className="ins-c-report-details-icon" />
                <strong> Detected issues</strong>
              </CardHeader>
              <CardBody>
                {report.reason && (
                  <Markdown
                    template={report.reason}
                    definitions={report.extra_data}
                  />
                )}
              </CardBody>
            </Card>
          </StackItem>
          <StackItem>
            <Card className="ins-m-card__flat">
              <CardHeader>
                <ThumbsUpIcon className="ins-c-report-details-icon" />
                <strong> Steps to resolve</strong>
              </CardHeader>
              <CardBody>
                {report.resolution && (
                  <Markdown
                    template={report.resolution}
                    definitions={report.extra_data}
                  />
                )}
              </CardBody>
            </Card>
          </StackItem>
          {report.links && ( // TODO: verify the field links in the API response
            <StackItem>
              <Card className="ins-m-card__flat">
                <CardHeader>
                  <LightbulbIcon className="ins-c-report-details-icon" />
                  <strong> Related Knowledgebase article </strong>
                </CardHeader>
                <CardBody>{report.links}</CardBody>
              </Card>
            </StackItem>
          )}
          {report.more_info && (
            <StackItem>
              <Card className="ins-m-card__flat">
                <CardHeader>
                  <InfoCircleIcon className="ins-c-report-details-icon" />
                  <strong> Additional info </strong>
                </CardHeader>
                <CardBody>
                  <Markdown
                    template={report.more_info}
                    definitions={report.extra_data}
                  />
                </CardBody>
              </Card>
            </StackItem>
          )}
        </Stack>
      </CardBody>
    </Card>
    */

ReportDetails.propTypes = {
  report: PropTypes.object.isRequired,
};

export default ReportDetails;
