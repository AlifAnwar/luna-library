"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@withalif/luna";
import styles from "./page.module.css";

export function FoundationControls() {
  return (
    <div className={styles.componentGrid}>
      <Card className={styles.showcaseCard}>
        <CardHeader>
          <CardTitle>Button scale</CardTitle>
          <p className={styles.cardDescription}>
            Four deliberate control heights for dense enterprise workflows.
          </p>
        </CardHeader>
        <CardContent className={styles.buttonScale}>
          <div>
            <span>Extra small · 28px</span>
            <Button size="xs">Quick action</Button>
          </div>
          <div>
            <span>Small · 32px</span>
            <Button size="sm" variant="secondary">
              Secondary
            </Button>
          </div>
          <div>
            <span>Default · 36px</span>
            <Button>Save changes</Button>
          </div>
          <div>
            <span>Large · 40px</span>
            <Button size="lg" variant="outline">
              Review details
            </Button>
          </div>
          <div className={styles.variantPreview}>
            <span>States & hierarchy</span>
            <span className={styles.variantActions}>
              <Button size="sm" variant="ghost">
                Ghost
              </Button>
              <Button size="sm" variant="destructive">
                Delete
              </Button>
              <Button size="sm" disabled>
                Disabled
              </Button>
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className={styles.showcaseCard}>
        <CardHeader>
          <CardTitle>Form controls</CardTitle>
          <p className={styles.cardDescription}>
            Compact by default, with clear labels and visible focus states.
          </p>
        </CardHeader>
        <CardContent className={styles.controlStack}>
          <div className={styles.field}>
            <span id="workflow-status-label">Workflow status</span>
            <Select defaultValue="active">
              <SelectTrigger aria-labelledby="workflow-status-label">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="review">In review</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <label className={styles.checkboxRow}>
            <Checkbox defaultChecked />
            <span>
              <strong>Include archived records</strong>
              <small>Show completed workflows in search results.</small>
            </span>
          </label>

          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              Open review dialog
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Review workflow</DialogTitle>
                <DialogDescription>
                  Confirm the workflow details before continuing. This preview
                  validates focus management, elevation, and content rhythm.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter showCloseButton>
                <Button>Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
